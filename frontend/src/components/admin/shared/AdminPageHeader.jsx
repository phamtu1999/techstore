import React from 'react'
import { ChevronRight } from 'lucide-react'

const AdminPageHeader = ({ 
  title, 
  accentTitle, 
  subtitle, 
  breadcrumb, 
  rightContent 
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
      <div>
        {breadcrumb && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
            {breadcrumb.map((item, index) => (
              <React.Fragment key={index}>
                <span className={`text-[9px] sm:text-[11px] font-bold uppercase tracking-wider ${index === breadcrumb.length - 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                  {item}
                </span>
                {index < breadcrumb.length - 1 && <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-300" />}
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 className="text-[22px] sm:text-[28px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
          {title} {accentTitle && <span className="text-primary-600">{accentTitle}</span>}
        </h1>
        {subtitle && (
          <p className="text-[12px] sm:text-[14px] text-gray-500 font-medium mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {rightContent && (
        <div className="flex items-center gap-3">
          {rightContent}
        </div>
      )}
    </div>
  )
}

export default AdminPageHeader
