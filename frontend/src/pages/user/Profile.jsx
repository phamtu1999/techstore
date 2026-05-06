import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { fireError, fireSuccess } from '../../utils/swalError'
import { getApiErrorMessage } from '../../utils/apiError'
import { ShieldCheck } from 'lucide-react'
import { profileAPI } from '../../api/profile'
import Orders from './Orders'
import Wishlist from './Wishlist'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice'

// Sub-components
import ProfileSidebar from '../../components/profile/ProfileSidebar'
import ProfileInfo from '../../components/profile/ProfileInfo'
import ProfileAddresses from '../../components/profile/ProfileAddresses'
import ProfileSecurity from '../../components/profile/ProfileSecurity'

const Profile = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'ROLE_STAFF'
  const [activeTab, setActiveTab] = useState('info')
  const [profile, setProfile] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [profileRes, addressesRes] = await Promise.all([
        profileAPI.getProfile(),
        profileAPI.getAddresses(),
      ])
      setProfile(profileRes.data.result)
      setAddresses(addressesRes.data.result)
    } catch (error) {
           console.error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    const { value: formValues } = await Swal.fire({
      title: '<div style="display: flex; align-items: center; gap: 10px; justify-content: center;"><span style="font-size: 24px;">✏️</span><span>Cập nhật thông tin cá nhân</span></div>',
      html: `
        <style>
          .profile-form-container {
            padding-top: 20px;
          }
          .profile-form-group {
            text-align: left;
            margin-bottom: 16px;
          }
          .profile-form-label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 6px;
          }
          .profile-form-input,
          .profile-form-select {
            width: 100%;
            height: 44px;
            padding: 0 14px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-size: 15px;
            transition: all 0.2s ease;
            background: white;
            box-sizing: border-box;
          }
          .profile-form-input:focus,
          .profile-form-select:focus {
            outline: none;
            border-color: #ff6600;
            box-shadow: 0 0 0 3px rgba(255, 102, 0, 0.1);
          }
          .profile-form-input:disabled {
            background: #f9fafb;
            color: #9ca3af;
            cursor: not-allowed;
          }
          .profile-form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .profile-form-note {
            font-size: 11px;
            color: #6b7280;
            margin-top: 4px;
            font-style: italic;
          }
          .swal2-popup {
            border-radius: 16px !important;
            padding: 28px !important;
            width: 560px !important;
          }
          .swal2-title {
            font-size: 20px !important;
            font-weight: 700 !important;
            color: #111827 !important;
            margin-bottom: 8px !important;
          }
          .swal2-html-container {
            margin: 0 !important;
            overflow: visible !important;
          }
          .swal2-actions {
            margin-top: 24px !important;
            gap: 12px !important;
          }
          .swal2-confirm {
            background: linear-gradient(135deg, #ff6600, #ff8533) !important;
            border-radius: 8px !important;
            padding: 12px 32px !important;
            font-weight: 600 !important;
            font-size: 15px !important;
            box-shadow: 0 4px 12px rgba(255, 102, 0, 0.3) !important;
            border: none !important;
            min-width: 140px !important;
          }
          .swal2-confirm:hover:not(:disabled) {
            opacity: 0.9 !important;
            transform: translateY(-1px);
          }
          .swal2-confirm:disabled {
            opacity: 0.6 !important;
            cursor: not-allowed !important;
          }
          .swal2-cancel {
            background: #f3f4f6 !important;
            color: #6b7280 !important;
            border-radius: 8px !important;
            padding: 12px 32px !important;
            font-weight: 600 !important;
            font-size: 15px !important;
            border: none !important;
          }
          .swal2-cancel:hover {
            background: #e5e7eb !important;
          }
          .swal2-close {
            font-size: 28px !important;
            color: #9ca3af !important;
            transition: all 0.2s !important;
          }
          .swal2-close:hover {
            color: #374151 !important;
            transform: rotate(90deg);
          }
          .error-text {
            color: #ef4444;
            font-size: 12px;
            margin-top: 4px;
            display: none;
          }
          .error-text.show {
            display: block;
          }
          .profile-form-input.error {
            border-color: #ef4444;
          }
        </style>
        <div class="profile-form-container">
          <div class="profile-form-group">
            <label class="profile-form-label">Họ và tên *</label>
            <input 
              id="swal-fullName" 
              class="profile-form-input" 
              value="${profile?.fullName || ''}" 
              placeholder="Nhập họ và tên đầy đủ"
            >
            <div class="error-text" id="fullName-error">Vui lòng nhập họ và tên</div>
          </div>
          
          <div class="profile-form-group">
            <label class="profile-form-label">Email</label>
            <input 
              id="swal-email" 
              class="profile-form-input" 
              value="${profile?.email || ''}" 
              disabled
            >
            <p class="profile-form-note">📧 Email không thể thay đổi (dùng để đăng nhập)</p>
          </div>
          
          <div class="profile-form-group">
            <label class="profile-form-label">Số điện thoại *</label>
            <input 
              id="swal-phone" 
              class="profile-form-input" 
              value="${profile?.phone || ''}" 
              placeholder="Nhập số điện thoại"
              maxlength="10"
            >
            <div class="error-text" id="phone-error">Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)</div>
          </div>
          
          <div class="profile-form-grid">
            <div class="profile-form-group">
              <label class="profile-form-label">Giới tính</label>
              <select id="swal-gender" class="profile-form-select">
                <option value="MALE" ${profile?.gender === 'MALE' ? 'selected' : ''}>Nam</option>
                <option value="FEMALE" ${profile?.gender === 'FEMALE' ? 'selected' : ''}>Nữ</option>
                <option value="OTHER" ${profile?.gender === 'OTHER' ? 'selected' : ''}>Khác</option>
              </select>
            </div>
            
            <div class="profile-form-group">
              <label class="profile-form-label">Ngày sinh</label>
              <input 
                id="swal-dob" 
                type="date" 
                class="profile-form-input" 
                value="${profile?.dateOfBirth || ''}"
                max="${new Date().toISOString().split('T')[0]}"
              >
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonText: '<span id="confirm-btn-text">Lưu thay đổi</span>',
      cancelButtonText: 'Hủy',
      width: '560px',
      backdrop: 'rgba(0, 0, 0, 0.4)',
      customClass: {
        popup: 'profile-modal-popup',
        confirmButton: 'profile-confirm-btn',
      },
      didOpen: () => {
        const fullNameInput = document.getElementById('swal-fullName')
        const phoneInput = document.getElementById('swal-phone')
        const fullNameError = document.getElementById('fullName-error')
        const phoneError = document.getElementById('phone-error')
        
        // Real-time validation for phone
        phoneInput.addEventListener('input', (e) => {
          const value = e.target.value.replace(/\D/g, '')
          e.target.value = value
          
          if (value && !/^0\d{9}$/.test(value)) {
            phoneInput.classList.add('error')
            phoneError.classList.add('show')
          } else {
            phoneInput.classList.remove('error')
            phoneError.classList.remove('show')
          }
        })
        
        // Real-time validation for fullName
        fullNameInput.addEventListener('input', (e) => {
          if (!e.target.value.trim()) {
            fullNameInput.classList.add('error')
            fullNameError.classList.add('show')
          } else {
            fullNameInput.classList.remove('error')
            fullNameError.classList.remove('show')
          }
        })
      },
      preConfirm: () => {
        const fullName = document.getElementById('swal-fullName').value.trim()
        const phone = document.getElementById('swal-phone').value.trim()
        const gender = document.getElementById('swal-gender').value
        const dateOfBirth = document.getElementById('swal-dob').value

        // Validation
        if (!fullName) {
          Swal.showValidationMessage('Vui lòng nhập họ và tên')
          return false
        }

        if (!phone) {
          Swal.showValidationMessage('Vui lòng nhập số điện thoại')
          return false
        }

        if (!/^0\d{9}$/.test(phone)) {
          Swal.showValidationMessage('Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng 0)')
          return false
        }

        // Show loading state
        const confirmBtn = Swal.getConfirmButton()
        const btnText = document.getElementById('confirm-btn-text')
        confirmBtn.disabled = true
        btnText.innerHTML = '<div style="display: flex; align-items: center; gap: 8px;"><div style="width: 16px; height: 16px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite;"></div>Đang lưu...</div>'

        return {
          fullName,
          phone,
          gender,
          dateOfBirth
        }
      }
    })

    if (formValues) {
      try {
        await profileAPI.updateProfile(formValues)
        Swal.fire({
          icon: 'success',
          title: 'Cập nhật thành công!',
          text: 'Thông tin cá nhân đã được cập nhật',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        })
        fetchData()
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi cập nhật',
          text: error.response?.data?.message || 'Không thể cập nhật thông tin, vui lòng thử lại',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        })
      }
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Swal.fire('Lỗi', 'Mật khẩu xác nhận không khớp', 'error')
      return
    }

    try {
      Swal.fire({ title: 'Đang xử lý...', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
      await profileAPI.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      })
      Swal.fire('Thành công', 'Đã đổi mật khẩu thành công', 'success')
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      Swal.fire('Lỗi', error.response?.data?.message || 'Mật khẩu cũ không chính xác', 'error')
    }
  }

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Đăng xuất?',
      text: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Ở lại',
      confirmButtonColor: '#ff6600'
    })

    if (result.isConfirmed) {
      dispatch(logout())
      navigate('/')
    }
  }

  const handleAddAddress = async () => {
    const { value: formValues } = await Swal.fire({
      title: '📍 Thêm địa chỉ mới',
      html: `
        <div class="grid grid-cols-2 gap-4 pt-4 text-left">
          <div class="col-span-2">
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Tên người nhận</label>
            <input id="swal-receiverName" class="swal2-input w-full m-0">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Số điện thoại</label>
            <input id="swal-addr-phone" class="swal2-input w-full m-0">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Tỉnh/Thành phố</label>
            <input id="swal-province" class="swal2-input w-full m-0">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Quận/Huyện</label>
            <input id="swal-district" class="swal2-input w-full m-0">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Phường/Xã</label>
            <input id="swal-ward" class="swal2-input w-full m-0">
          </div>
          <div class="col-span-2">
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Địa chỉ chi tiết</label>
            <input id="swal-detailedAddress" class="swal2-input w-full m-0">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Thêm mới',
      preConfirm: () => {
        return {
          receiverName: document.getElementById('swal-receiverName').value,
          phone: document.getElementById('swal-addr-phone').value,
          province: document.getElementById('swal-province').value,
          district: document.getElementById('swal-district').value,
          ward: document.getElementById('swal-ward').value,
          detailedAddress: document.getElementById('swal-detailedAddress').value,
          isDefault: false
        }
      }
    })

    if (formValues) {
      try {
        await profileAPI.addAddress(formValues)
        Swal.fire('Thành công', 'Đã thêm địa chỉ mới', 'success')
        fetchData()
      } catch (error) {
        Swal.fire('Lỗi', 'Thao tác thất bại', 'error')
      }
    }
  }

  const handleDeleteAddress = async (id) => {
    try {
        await profileAPI.deleteAddress(id)
        fetchData()
    } catch (error) {
        Swal.fire('Lỗi', 'Không thể xóa địa chỉ', 'error')
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return <ProfileInfo profile={profile} handleUpdateProfile={handleUpdateProfile} />
      case 'orders':
        return <Orders embedded />
      case 'addresses':
        return <ProfileAddresses addresses={addresses} handleAddAddress={handleAddAddress} handleDeleteAddress={handleDeleteAddress} />
      case 'wishlist':
        return <Wishlist embedded />
      case 'security':
        return <ProfileSecurity passwordForm={passwordForm} setPasswordForm={setPasswordForm} handleChangePassword={handleChangePassword} />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600 shadow-xl" />
          <p className="text-sm font-black text-gray-400 animate-pulse uppercase tracking-widest">Đang tải hồ sơ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <ProfileSidebar 
            profile={profile} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            handleLogout={handleLogout} 
            isAdmin={isAdmin}
          />

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100">
             <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="h-8 w-8 text-indigo-200" />
                <h4 className="font-black text-sm uppercase tracking-wider">Xác thực 2 lớp</h4>
             </div>
             <p className="text-xs text-indigo-100 mb-4 opacity-80">Bật 2FA để bảo vệ tài khoản của bạn an toàn tuyệt đối ngay hôm nay.</p>
             <button className="w-full bg-white/20 hover:bg-white/30 text-white text-[10px] font-black py-2 rounded-xl transition-all uppercase tracking-widest">Thiết lập ngay</button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] shadow-xl border border-gray-100 p-3 sm:p-8 min-h-[600px] overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
