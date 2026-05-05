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
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
      <div>
        {breadcrumb && (
          <div className="flex items-center gap-2 mb-2">
            {breadcrumb.map((item, index) => (
              <React.Fragment key={index}>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${index === breadcrumb.length - 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                  {item}
                </span>
                {index < breadcrumb.length - 1 && <ChevronRight className="h-3 w-3 text-gray-300" />}
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight">
          {title} {accentTitle && <span className="text-primary-600">{accentTitle}</span>}
        </h1>
        {subtitle && (
          <p className="text-[14px] text-gray-500 font-medium mt-1">
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
