import { BellRing, Send, Settings, Mail, ShieldCheck, Bell } from 'lucide-react'
import Swal from 'sweetalert2'

const BroadcastNotification = () => {
  const handleBroadcast = async () => {
    const title = document.getElementById('broadcast-title').value;
    const message = document.getElementById('broadcast-message').value;
    const type = document.getElementById('broadcast-type').value;
    const link = document.getElementById('broadcast-link').value;
    
    if (!title || !message) {
        Swal.fire({
            icon: 'error',
            title: 'Thiếu thông tin',
            text: 'Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
        return;
    }

    try {
        const { notificationsAPI } = await import('../../../api/notifications');
        await notificationsAPI.broadcastNotification({ title, message, type, link });
        Swal.fire({
            icon: 'success',
            title: 'Gửi thành công',
            text: 'Thông báo đã được gửi đến toàn thể người dùng',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
        document.getElementById('broadcast-title').value = '';
        document.getElementById('broadcast-message').value = '';
        document.getElementById('broadcast-link').value = '';
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi gửi thông báo',
            text: error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Broadcast Card */}
      <div className="bg-white dark:bg-dark-card rounded-2xl p-4 sm:p-8 border border-gray-100 dark:border-dark-border shadow-sm">
        <div className="mb-6 sm:mb-10">
            <h3 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2 sm:gap-3 uppercase italic">
                <BellRing className="h-6 w-6 text-admin-primary" />
                Gửi thông báo hệ thống
            </h3>
            <p className="text-[11px] sm:text-[13px] text-gray-500 font-bold mt-1.5 sm:mt-2">Nội dung này sẽ được gửi tới <strong className="text-admin-primary underline">tất cả</strong> khách hàng ngay lập tức trên các nền tảng.</p>
        </div>
        
        <div className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                <div className="group space-y-2 sm:space-y-3">
                    <label className="text-[10px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1 group-focus-within:text-admin-primary transition-colors">Tiêu đề thông báo</label>
                    <input 
                        id="broadcast-title" 
                        type="text" 
                        className="w-full h-12 sm:h-14 px-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent rounded-xl sm:rounded-[1.25rem] focus:border-admin-primary focus:bg-white dark:focus:bg-dark-bg transition-all text-[14px] sm:text-[15px] font-black text-gray-900 dark:text-white outline-none placeholder:text-gray-400" 
                        placeholder="VD: Cửa hàng bảo trì định kỳ..." 
                    />
                </div>
                <div className="group space-y-2 sm:space-y-3">
                    <label className="text-[10px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1 group-focus-within:text-admin-primary transition-colors">Phân loại</label>
                    <div className="relative">
                        <select id="broadcast-type" className="w-full h-12 sm:h-14 px-4 pr-10 bg-gray-50 dark:bg-white/5 border-2 border-transparent rounded-xl sm:rounded-[1.25rem] focus:border-admin-primary focus:bg-white dark:focus:bg-dark-bg transition-all text-[14px] sm:text-[15px] font-black text-gray-900 dark:text-white outline-none appearance-none cursor-pointer">
                            <option value="SYSTEM">Hệ thống</option>
                            <option value="PROMOTION">Khuyến mãi</option>
                            <option value="ORDER">Đơn hàng</option>
                            <option value="IMPORTANT">Quan trọng</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                             <Settings className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="group space-y-2 sm:space-y-3">
                <label className="text-[10px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1 group-focus-within:text-admin-primary transition-colors">Nội dung chi tiết</label>
                <textarea 
                    id="broadcast-message" 
                    className="w-full min-h-[100px] sm:min-h-[120px] px-4 py-3 sm:px-5 sm:py-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent rounded-xl sm:rounded-[1.25rem] focus:border-admin-primary focus:bg-white dark:focus:bg-dark-bg transition-all text-[14px] sm:text-[15px] font-bold text-gray-900 dark:text-white outline-none resize-none leading-relaxed placeholder:text-gray-400" 
                    placeholder="Nhập nội dung thông báo tại đây..." 
                />
            </div>

            <div className="group space-y-2 sm:space-y-3">
                <label className="text-[10px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1 group-focus-within:text-admin-primary transition-colors">Đường dẫn liên kết (Tùy chọn)</label>
                <input 
                    id="broadcast-link" 
                    type="text" 
                    className="w-full h-12 sm:h-14 px-4 bg-gray-50 dark:bg-white/5 border-2 border-transparent rounded-xl sm:rounded-[1.25rem] focus:border-admin-primary focus:bg-white dark:focus:bg-dark-bg transition-all text-[14px] sm:text-[15px] font-black text-gray-900 dark:text-white outline-none placeholder:text-gray-400" 
                    placeholder="VD: /products/iphone-15" 
                />
            </div>

            <button 
                onClick={handleBroadcast} 
                className="w-full h-12 sm:h-14 bg-admin-primary text-white rounded-xl sm:rounded-[1.25rem] font-black text-[14px] sm:text-[15px] shadow-xl shadow-admin-primary/20 hover:bg-admin-primary/90 transition-all flex items-center justify-center gap-2 active:scale-[0.98] uppercase tracking-widest"
            >
                <Send className="h-5 w-5" /> 
                GỬI THÔNG BÁO NGAY
            </button>
        </div>
      </div>

      {/* Auto Notifications Section */}
      <div className="bg-white dark:bg-dark-card rounded-2xl p-4 sm:p-8 border border-gray-100 dark:border-dark-border shadow-sm">
        <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2 sm:gap-3 uppercase italic">
                <Settings className="h-6 w-6 text-admin-primary" />
                Thông báo tự động
            </h3>
            <p className="text-[11px] sm:text-[13px] text-gray-500 font-bold mt-1.5 sm:mt-2">Cấu hình các kịch bản gửi tin nhắn tự động kích hoạt bởi hành vi người dùng.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
            {[
                { label: 'Đơn hàng mới', enabled: true, desc: 'Báo cho Admin khi có người mua hàng', icon: Bell },
                { label: 'Xác nhận đơn', enabled: true, desc: 'Gửi Email xác nhận cho khách hàng', icon: Mail },
                { label: 'Bảo mật Step-up', enabled: true, desc: 'Yêu cầu OTP khi thao tác nhạy cảm', icon: ShieldCheck },
                { label: 'Thông báo đẩy', enabled: false, desc: 'Gửi Web Push thông báo khuyến mãi', icon: BellRing },
            ].map((pref, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 sm:p-5 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-white dark:hover:bg-dark-bg border border-transparent hover:border-gray-100 dark:hover:border-white/10 transition-all group shadow-sm hover:shadow-md">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2.5 sm:p-3 bg-white dark:bg-dark-card rounded-xl shadow-sm text-gray-400 group-hover:text-admin-primary group-hover:scale-110 transition-all">
                            <pref.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                            <p className="text-gray-900 dark:text-white font-black text-[13px] sm:text-[14px] tracking-tight">{pref.label}</p>
                            <p className="text-[10px] sm:text-[12px] text-gray-500 dark:text-gray-400 font-bold leading-tight">{pref.desc}</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer scale-90 sm:scale-100">
                        <input type="checkbox" className="sr-only peer" defaultChecked={pref.enabled} />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary shadow-inner"></div>
                    </label>
                </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default BroadcastNotification
