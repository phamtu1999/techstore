import { Moon, Sun, Menu } from 'lucide-react'

interface HeaderProps {
  title: string
  isDarkMode: boolean
  onToggleDarkMode: () => void
  onMenuClick: () => void
  username?: string
  role?: string
}

const Header = ({ title, isDarkMode, onToggleDarkMode, onMenuClick, username = 'Admin', role = 'Administrator' }: HeaderProps) => {
  return (
    <header className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-xl border-b border-border dark:border-dark-border sticky top-0 z-20 transition-colors duration-300 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex justify-between items-center gap-3">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <button 
            onClick={onMenuClick}
            className="lg:hidden flex-shrink-0 p-2.5 -ml-1 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg text-text-primary dark:text-dark-text"
            aria-label="Mở menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary dark:text-gray-400 mb-0.5">
              <span className="hidden sm:inline">Bảng điều khiển</span>
              <span className="hidden sm:inline">/</span>
              <span className="truncate">{title}</span>
            </div>
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-text-primary dark:text-dark-text truncate leading-tight tracking-tight">
              {title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Dark mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors duration-200"
            title={isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
            aria-label={isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-text-primary dark:text-dark-text" />
            ) : (
              <Moon className="h-5 w-5 text-text-primary dark:text-dark-text" />
            )}
          </button>
          
          {/* User info */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right hidden sm:block max-w-[140px]">
              <p className="text-sm font-medium text-text-primary dark:text-dark-text truncate">{username}</p>
            </div>
            <div className="h-9 w-9 sm:h-10 sm:w-10 bg-primary-main rounded-xl flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
              {username.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
