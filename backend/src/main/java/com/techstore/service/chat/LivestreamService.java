package com.techstore.service.chat;

import com.techstore.dto.chat.LivestreamRequest;
import com.techstore.dto.chat.LivestreamResponse;
import com.techstore.entity.chat.Livestream;
import com.techstore.entity.product.Product;
import com.techstore.entity.user.User;
import com.techstore.exception.AppException;
import com.techstore.exception.ErrorCode;
import com.techstore.repository.chat.LivestreamRepository;
import com.techstore.repository.product.ProductRepository;
import com.techstore.repository.user.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LivestreamService {

    private final LivestreamRepository livestreamRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final StringRedisTemplate redisTemplate;

    private static final String VIEWERS_KEY_PREFIX = "livestream:viewers:";

    @Transactional(readOnly = true)
    public List<LivestreamResponse> getAll() {
        return livestreamRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LivestreamResponse> getLive() {
        return livestreamRepository.findByStatus(Livestream.LivestreamStatus.LIVE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LivestreamResponse> getUpcoming() {
        return livestreamRepository.findByStatus(Livestream.LivestreamStatus.UPCOMING).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LivestreamResponse> getPopular(int limit) {
        return livestreamRepository.findPopularLiveStreams().stream()
                .limit(limit)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LivestreamResponse getById(String id) {
        Livestream livestream = livestreamRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));
        
        // Sync viewer count from Redis if it's LIVE
        if (livestream.getStatus() == Livestream.LivestreamStatus.LIVE) {
            String count = redisTemplate.opsForValue().get(VIEWERS_KEY_PREFIX + id);
            if (count != null) {
                livestream.setViewerCount(Integer.parseInt(count));
            }
        }
        
        return mapToResponse(livestream);
    }

    @Transactional
    public LivestreamResponse createStream(LivestreamRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User streamer = userRepository.findByEmail(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Livestream livestream = Livestream.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .thumbnailUrl(request.getThumbnailUrl())
                .streamUrl(request.getStreamUrl())
                .status(Livestream.LivestreamStatus.LIVE)
                .streamer(streamer)
                .startTime(Instant.now())
                .viewerCount(0)
                .build();

        if (request.getActiveProductId() != null) {
            Product product = productRepository.findById(request.getActiveProductId())
                    .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));
            livestream.setActiveProduct(product);
        }

        log.info("Streamer {} started a new livestream: {}", username, livestream.getTitle());
        return mapToResponse(livestreamRepository.save(livestream));
    }

    @Transactional
    public LivestreamResponse updateStatus(String id, String status) {
        Livestream livestream = livestreamRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));
        
        validateOwnership(livestream);
        
        Livestream.LivestreamStatus newStatus = Livestream.LivestreamStatus.valueOf(status.toUpperCase());
        livestream.setStatus(newStatus);
        
        if (newStatus == Livestream.LivestreamStatus.ENDED) {
            livestream.setEndTime(Instant.now());
            // Sync final viewer count from Redis before deleting
            String count = redisTemplate.opsForValue().get(VIEWERS_KEY_PREFIX + id);
            if (count != null) {
                livestream.setViewerCount(Integer.parseInt(count));
            }
            redisTemplate.delete(VIEWERS_KEY_PREFIX + id);
        }
        
        log.info("Livestream {} status updated to {}", id, newStatus);
        return mapToResponse(livestreamRepository.save(livestream));
    }

    @Transactional
    public LivestreamResponse pushProduct(String id, String productId) {
        Livestream livestream = livestreamRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));
        
        validateOwnership(livestream);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));
        
        livestream.setActiveProduct(product);
        log.info("Livestream {} active product updated to {}", id, product.getName());
        return mapToResponse(livestreamRepository.save(livestream));
    }

    public void incrementViewerCount(String id) {
        redisTemplate.opsForValue().increment(VIEWERS_KEY_PREFIX + id);
    }

    public void decrementViewerCount(String id) {
        Long current = redisTemplate.opsForValue().decrement(VIEWERS_KEY_PREFIX + id);
        if (current != null && current < 0) {
            redisTemplate.opsForValue().set(VIEWERS_KEY_PREFIX + id, "0");
        }
    }

    private void validateOwnership(Livestream livestream) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MANAGER"));
        
        if (!isAdmin && !livestream.getStreamer().getEmail().equals(username)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private LivestreamResponse mapToResponse(Livestream livestream) {
        Product activeProduct = livestream.getActiveProduct();
        String productImage = (activeProduct != null && activeProduct.getImages() != null && !activeProduct.getImages().isEmpty())
                ? activeProduct.getImages().iterator().next().getImageUrl()
                : livestream.getThumbnailUrl();

        return LivestreamResponse.builder()
                .id(livestream.getId())
                .title(livestream.getTitle())
                .thumbnailUrl(livestream.getThumbnailUrl())
                .viewerCount(livestream.getViewerCount())
                .streamerUsername(livestream.getStreamer().getFullName())
                .streamerAvatar("https://ui-avatars.com/api/?name=" + livestream.getStreamer().getFullName())
                .productId(activeProduct != null ? activeProduct.getId() : null)
                .productName(activeProduct != null ? activeProduct.getName() : null)
                .productImage(productImage)
                .streamUrl(livestream.getStreamUrl())
                .productSlug(activeProduct != null ? activeProduct.getSlug() : null)
                .build();
    }
}
