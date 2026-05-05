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
    <div className="space-y-6 pb-12">
      {/* Broadcast Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="mb-6">
            <h3 className="text-[16px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
                📢 Gửi thông báo hệ thống
            </h3>
            <p className="text-[13px] text-gray-500 font-medium mt-1">Nội dung này sẽ được gửi tới <strong>tất cả</strong> khách hàng ngay lập tức</p>
        </div>
        
        <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Tiêu đề thông báo</label>
                    <input 
                        id="broadcast-title" 
                        type="text" 
                        className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-admin-primary/20 focus:bg-white transition-all text-[14px] font-medium outline-none" 
                        placeholder="VD: Cửa hàng bảo trì định kỳ..." 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Phân loại</label>
                    <select id="broadcast-type" className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-admin-primary/20 focus:bg-white transition-all text-[14px] font-medium outline-none appearance-none cursor-pointer">
                        <option value="SYSTEM">Hệ thống</option>
                        <option value="PROMOTION">Khuyến mãi</option>
                        <option value="ORDER">Đơn hàng</option>
                        <option value="IMPORTANT">Quan trọng</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Nội dung chi tiết</label>
                <textarea 
                    id="broadcast-message" 
                    className="w-full min-h-[100px] px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-admin-primary/20 focus:bg-white transition-all text-[14px] font-medium outline-none resize-none" 
                    placeholder="Nhập nội dung thông báo tại đây..." 
                />
            </div>

            <div className="space-y-2">
                <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Đường dẫn liên kết (Tùy chọn)</label>
                <input 
                    id="broadcast-link" 
                    type="text" 
                    className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-admin-primary/20 focus:bg-white transition-all text-[14px] font-medium outline-none" 
                    placeholder="VD: /products/iphone-15" 
                />
            </div>

            <button 
                onClick={handleBroadcast} 
                className="w-full h-12 bg-admin-primary text-white rounded-xl font-bold text-[15px] shadow-sm shadow-admin-primary/20 hover:bg-admin-primary/90 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
                <Send className="h-5 w-5" /> Gửi tới toàn bộ khách hàng
            </button>
        </div>
      </div>

      {/* Auto Notifications Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="mb-6">
            <h3 className="text-[16px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
                ⚙️ Thông báo tự động
            </h3>
            <p className="text-[13px] text-gray-500 font-medium mt-1">Cấu hình các kịch bản gửi tin nhắn tự động từ hệ thống</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
                { label: 'Đơn hàng mới', enabled: true, desc: 'Báo cho Admin khi có người mua hàng', icon: Bell },
                { label: 'Xác nhận đơn', enabled: true, desc: 'Gửi Email xác nhận cho khách hàng', icon: Mail },
                { label: 'Bảo mật Step-up', enabled: true, desc: 'Yêu cầu OTP khi thao tác nhạy cảm', icon: ShieldCheck },
                { label: 'Thông báo đẩy', enabled: false, desc: 'Gửi Web Push thông báo khuyến mãi', icon: BellRing },
            ].map((pref, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-white border border-transparent hover:border-gray-100 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white rounded-lg shadow-sm text-gray-400 group-hover:text-admin-primary transition-colors">
                            <pref.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-gray-900 font-bold text-[14px] tracking-tight">{pref.label}</p>
                            <p className="text-[12px] text-gray-500 font-medium">{pref.desc}</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={pref.enabled} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                    </label>
                </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default BroadcastNotification
