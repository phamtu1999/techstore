package com.techstore.service.chat;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.techstore.dto.chat.ChatIntent;
import com.techstore.dto.chat.ChatMessage;
import com.techstore.dto.chat.ChatRequest;
import com.techstore.entity.order.Order;
import com.techstore.entity.user.User;
import com.techstore.repository.order.OrderRepository;
import com.techstore.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private static final int MAX_HISTORY = 10;
    private static final String SESSION_PREFIX = "chat:session:";

    public Flux<String> streamResponse(ChatRequest request, User user) {
        if (request == null || request.getMessage() == null || request.getMessage().isBlank()) {
            return Flux.just("Chào bạn! TechStore có thể giúp gì cho bạn hôm nay ạ?");
        }

        String sessionId = request.getSessionId() != null ? request.getSessionId() :
                (user != null ? user.getId().toString() : "anonymous");
        String sessionKey = SESSION_PREFIX + sessionId;

        try {
            ChatIntent intent = classifyIntent(request.getMessage());
            String contextData = fetchContextData(intent, request.getMessage(), user);
            String assistantMessage = buildInternalResponse(intent, contextData, user);

            return streamText(assistantMessage)
                    .filter(text -> text != null && !text.isBlank())
                    .doFinally(signal -> saveChatTurn(sessionKey, request.getMessage(), assistantMessage))
                    .onErrorResume(e -> {
                        log.error("Internal Chat error: ", e);
                        return Flux.just("Hệ thống đang bận một chút, bạn vui lòng quay lại sau nha!");
                    });
        } catch (Exception e) {
            log.error("Chat processing error: ", e);
            return Flux.just("Rất tiếc, đã có lỗi xảy ra khi xử lý tin nhắn của bạn.");
        }
    }

    private String buildInternalResponse(ChatIntent intent, String contextData, User user) {
        StringBuilder fullResponse = new StringBuilder();
        String name = user != null ? user.getFullName() : "Quý khách";

        switch (intent) {
            case PRODUCT -> {
                fullResponse.append(String.format("Chào %s! TechStore vừa tìm được các sản phẩm phù hợp với nhu cầu của bạn đây ạ:\n\n", name));
                fullResponse.append(contextData);
                fullResponse.append("\n\nBạn có muốn mình tư vấn thêm về cấu hình hay so sánh giữa các dòng máy không?");
            }
            case ORDER -> {
                fullResponse.append(String.format("Chào %s! Về thông tin đơn hàng của bạn:\n\n", name));
                fullResponse.append(contextData);
            }
            default -> {
                fullResponse.append(String.format("Chào %s! TechStore rất vui được hỗ trợ bạn.\n\n", name));
                fullResponse.append("Tôi có thể giúp bạn:\n");
                fullResponse.append("- 📱 **Tìm kiếm sản phẩm**: (vd: 'iPhone 15 Pro Max', 'Laptop cho đồ họa')\n");
                fullResponse.append("- 📦 **Tra cứu đơn hàng**: (vd: 'Đơn hàng của tôi đâu?', 'Trạng thái đơn hàng')\n");
                fullResponse.append("- 🛠️ **Tư vấn cấu hình**: (vd: 'So sánh iPhone và Samsung')\n\n");
                fullResponse.append("Bạn đang quan tâm đến dòng sản phẩm nào ạ?");
            }
        }

        return fullResponse.toString();
    }

    private Flux<String> streamText(String text) {
        String[] words = text.split("(?<=\\s)|(?=\\s)");
        return Flux.fromArray(words)
                .delayElements(Duration.ofMillis(20))
                .filter(word -> !word.isEmpty());
    }

    private String fetchContextData(ChatIntent intent, String message, User user) {
        if (intent == ChatIntent.PRODUCT) {
            String keyword = extractKeyword(message);
            if (keyword.isEmpty()) return "TechStore có rất nhiều mẫu laptop, điện thoại mới nhất. Bạn quan tâm thương hiệu nào ạ?";
            
            // Search by name containing keyword
            var products = productRepository.findByNameContainingIgnoreCase(keyword, PageRequest.of(0, 3));
            
            if (products.isEmpty()) {
                return String.format("Hiện tại TechStore chưa có kết quả chính xác cho '%s'. Nhưng chúng mình có rất nhiều lựa chọn tương tự, bạn có muốn mình gợi ý không?", keyword);
            }
            
            return products.getContent().stream()
                    .map((com.techstore.entity.product.Product p) -> {
                        String priceStr = p.getPrice() != null ? String.format("%,d", p.getPrice().longValue()) : "Liên hệ";
                        return String.format("🔹 **%s**\n   💰 Giá từ: **%sđ**\n   🔗 [Xem chi tiết](/product/%s)", 
                                p.getName(), priceStr, p.getSlug());
                    })
                    .collect(Collectors.joining("\n\n"));
        }
        
        if (intent == ChatIntent.ORDER) {
            if (user == null) {
                return "⚠️ Bạn vui lòng **đăng nhập** để mình có thể kiểm tra trạng thái đơn hàng chính xác nhất nhé!";
            }
            
            // Get latest order for the user
            var orders = orderRepository.findAllByUserOrderByCreatedAtDesc(user, PageRequest.of(0, 1));
            if (orders.isEmpty()) {
                return "Bạn chưa có đơn hàng nào tại TechStore. Hãy chọn cho mình một món đồ ưng ý nhé! 😊";
            }
            
            Order latest = orders.getContent().get(0);
            String statusDesc = translateStatus(latest.getStatus());
            return String.format("📦 Mã đơn: **#%s**\n📅 Ngày đặt: %s\n🏷️ Trạng thái: **%s**\n\n%s", 
                    latest.getId().substring(0, 8).toUpperCase(),
                    latest.getCreatedAt().atZone(java.time.ZoneId.of("Asia/Ho_Chi_Minh")).format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                    statusDesc,
                    "Bạn có thể theo dõi chi tiết tại [Lịch sử mua hàng](/account/orders).");
        }
        
        return "";
    }

    private String translateStatus(com.techstore.entity.order.OrderStatus status) {
        return switch (status) {
            case PENDING -> "⏳ Đang chờ xác nhận";
            case CONFIRMED -> "✅ Đã xác nhận";
            case PROCESSING -> "⚙️ Đang xử lý";
            case SHIPPING -> "🚚 Đang giao hàng";
            case DELIVERED -> "🏁 Giao hàng thành công";
            case CANCELLED -> "❌ Đã hủy";
            case REVIEWED -> "⭐ Đã đánh giá";
        };
    }

    private List<ChatMessage> getHistory(String sessionKey) {
        try {
            String json = redisTemplate.opsForValue().get(sessionKey);
            if (json == null) return new ArrayList<>();
            return objectMapper.readValue(json, new TypeReference<List<ChatMessage>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private void saveChatTurn(String sessionKey, String userMessage, String assistantMessage) {
        try {
            List<ChatMessage> history = getHistory(sessionKey);
            history.add(new ChatMessage("user", userMessage));
            history.add(new ChatMessage("assistant", assistantMessage));
            if (history.size() > MAX_HISTORY) {
                history = history.subList(history.size() - MAX_HISTORY, history.size());
            }
            redisTemplate.opsForValue().set(sessionKey, objectMapper.writeValueAsString(history), Duration.ofHours(2));
        } catch (Exception e) {
            log.error("Failed to save chat history: ", e);
        }
    }

    private ChatIntent classifyIntent(String message) {
        String lower = message.toLowerCase();
        if (lower.matches(".*(giá|mua|sản phẩm|laptop|điện thoại|tai nghe|tư vấn|so sánh|có bán|iphone|samsung|macbook|ipad|watch|oppo|xiaomi|cấu hình|ram|chip).*"))
            return ChatIntent.PRODUCT;
        if (lower.matches(".*(đơn hàng|vận chuyển|giao hàng|trạng thái|mã đơn|hủy đơn|đơn của tôi|check).*"))
            return ChatIntent.ORDER;
        return ChatIntent.GENERAL;
    }

    private String extractKeyword(String msg) {
        String lower = msg.toLowerCase();
        // Priority keywords (Brands)
        String[] brands = {"iphone", "macbook", "samsung", "laptop", "watch", "ipad", "oppo", "xiaomi", "asus", "dell", "hp", "lenovo", "acer", "msi"};
        for (String k : brands) {
            if (lower.contains(k)) return k;
        }
        
        // Remove common fillers
        String clean = lower.replaceAll("(tìm|giúp|tôi|cho|hỏi|giá|bán|có|không|về|cái|chiếc|mẫu|dòng)", "").trim();
        String[] words = clean.split("\\s+");
        if (words.length > 0) {
            return words[words.length - 1]; // Often the most specific noun
        }
        return "";
    }
}
