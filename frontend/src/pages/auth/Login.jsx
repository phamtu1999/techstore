import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login, clearError } from '../../store/slices/authSlice'
import { 
  Lock, User, Eye, EyeOff, Store, 
  ArrowRight, ShieldCheck, Sparkles, Globe, Chrome 
} from 'lucide-react'
import { getApiErrorMessage } from '../../utils/apiError'
import { authAPI } from '../../api/auth'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoading, error } = useSelector((state) => state.auth)
  const searchParams = new URLSearchParams(location.search)
  const redirectPath = searchParams.get('redirect') || '/'

  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (error) dispatch(clearError())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await dispatch(login(formData)).unwrap()
      if (result?.token) {
        navigate(redirectPath, { replace: true })
      }
    } catch (error) {
      console.error(getApiErrorMessage(error))
    }
  }

  const handleGoogleLogin = () => {
    authAPI.googleLogin()
  }

  return (
    <div className="min-h-[80vh] flex items-stretch justify-center py-3 sm:py-8 px-3 sm:px-4 lg:px-8 bg-gradient-to-br from-[#f7f7f7] to-white/50">
      <div className="max-w-[1000px] w-full flex flex-col lg:flex-row bg-white rounded-3xl sm:rounded-[32px] shadow-2xl overflow-hidden animate-fade-in border border-gray-100">
        
        {/* Left Side: Branding/Banner */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#0f172a] p-6 sm:p-10 lg:p-12 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-MAIN/20 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
          
          <div className="relative">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-tr from-primary-MAIN to-orange-400 p-2 rounded-xl shadow-lg ring-4 ring-primary-MAIN/20">
                <Store className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight">
                TECH<span className="text-primary-MAIN">ZONE</span>
              </span>
            </Link>
          </div>

          <div className="relative space-y-6">
            <h2 className="text-4xl font-black leading-tight">
              Chào mừng <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-MAIN to-orange-400">Trở lại</span>
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary-MAIN/20 transition-colors">
                  <ShieldCheck className="h-6 w-6 text-primary-MAIN" />
                </div>
                <div>
                  <p className="font-bold">Bảo mật tuyệt đối</p>
                  <p className="text-sm text-gray-400">Tài khoản của bạn luôn được bảo vệ</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary-MAIN/20 transition-colors">
                  <Sparkles className="h-6 w-6 text-primary-MAIN" />
                </div>
                <div>
                  <p className="font-bold">Ưu đãi cá nhân</p>
                  <p className="text-sm text-gray-400">Nhận gợi ý sản phẩm phù hợp nhất</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative text-sm text-gray-500 border-t border-white/5 pt-8">
            &copy; 2024 TechZone. Kết nối đam mê công nghệ.
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 p-5 sm:p-8 md:p-12">
          <div className="max-w-[420px] mx-auto w-full">
            <div className="mb-8 sm:mb-10 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-secondary-800 tracking-tight">Đăng nhập</h1>
              <p className="text-sm sm:text-base text-gray-400 mt-2 font-medium">Tiếp tục hành trình mua sắm của bạn.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-2xl mb-6 text-sm font-bold animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="email"
                  placeholder="Email đăng nhập"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full h-14 pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-MAIN focus:ring-4 focus:ring-primary-MAIN/10 transition-all outline-none font-medium text-secondary-800"
                />
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full h-14 pl-12 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-MAIN focus:ring-4 focus:ring-primary-MAIN/10 transition-all outline-none font-medium text-secondary-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-MAIN"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link to="/forgot-password" size="sm" className="text-xs sm:text-sm font-bold text-primary-MAIN hover:underline">
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-[#ff7a00] to-[#ff4d00] text-white rounded-full font-black text-base sm:text-lg shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 no-hover-scale"
              >
                {isLoading ? (
                  <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>ĐĂNG NHẬP</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="my-5 sm:my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200"></div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Hoặc</span>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-14 border border-gray-200 text-secondary-800 rounded-full font-black text-base sm:text-lg bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm"
            >
              <Chrome className="h-5 w-5 text-[#4285F4]" />
              <span>Đăng nhập bằng Google</span>
            </button>

            <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
              <p className="text-sm sm:text-base text-gray-500 font-medium text-center">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-secondary-800 font-black hover:text-primary-MAIN transition-colors">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

