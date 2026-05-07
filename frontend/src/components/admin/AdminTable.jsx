import { Edit2, Trash2, MoreVertical, Copy, EyeOff, Eye } from 'lucide-react'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { List } from 'react-window'

const AdminTable = ({ 
  columns, 
  data = [], 
  onEdit, 
  onDelete, 
  onDuplicate,
  onToggleStatus,
  actions, 
  showIndex = false, 
  currentPage = 0, 
  pageSize = 10,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  sortConfig,
  onSort,
  rowClassName,
  virtualized = false,
  rowHeight = 72,
  maxHeight = 640,
  renderMobileCard: customRenderMobileCard,
  itemTitle = 'mục'
}) => {
  const [openDropdown, setOpenDropdown] = useState(null)
  const containerRef = useRef(null)
  const hasActions = onEdit || onDelete || actions
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setOpenDropdown(null)
  }, [data])

  const hasSelection = onSelectRow && onSelectAll
  const allSelected = hasSelection && data.length > 0 && selectedRows.length === data.length

  const handleSort = (key) => {
    if (onSort) {
      const direction = sortConfig?.key === key && sortConfig?.direction === 'asc' ? 'desc' : 'asc'
      onSort({ key, direction })
    }
  }

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) return '↕️'
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  const renderActions = (row, index) => {
    if (isMobile) {
      return (
        <div className="relative">
          <button 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setOpenDropdown(openDropdown?.index === index ? null : { index, x: rect.right, y: rect.bottom })
            }} 
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-secondary-900 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {openDropdown?.index === index && (
            <>
              <div className="fixed inset-0 z-[110]" onClick={() => setOpenDropdown(null)} />
              <div 
                className="fixed mt-2 w-44 bg-white dark:bg-dark-card rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-white/5 py-1.5 z-[120] animate-scale-up"
                style={{ 
                  top: `${openDropdown.y}px`, 
                  right: `${window.innerWidth - openDropdown.x}px` 
                }}
              >
                {onEdit && (
                  <button onClick={() => { onEdit(row); setOpenDropdown(null) }} className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-secondary-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3">
                    <Edit2 className="h-4 w-4 text-blue-500" /> Chỉnh sửa
                  </button>
                )}
                {onDuplicate && (
                  <button onClick={() => { onDuplicate(row); setOpenDropdown(null) }} className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-secondary-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3">
                    <Copy className="h-4 w-4 text-emerald-500" /> Nhân bản
                  </button>
                )}
                {onToggleStatus && (
                  <button onClick={() => { onToggleStatus(row); setOpenDropdown(null) }} className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-secondary-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3">
                    {row.active ? <EyeOff className="h-4 w-4 text-orange-500" /> : <Eye className="h-4 w-4 text-emerald-500" />}
                    {row.active ? `Ẩn ${itemTitle}` : `Hiện ${itemTitle}`}
                  </button>
                )}
                <div className="h-[1px] bg-gray-100 dark:bg-white/5 my-1" />
                {onDelete && (
                  <button onClick={() => { onDelete(row); setOpenDropdown(null) }} className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3">
                    <Trash2 className="h-4 w-4" /> Xóa {itemTitle}
                  </button>
                )}
                {actions && (
                  <div className="px-2 pb-1.5">
                    {actions(row, () => setOpenDropdown(null))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2">
        {actions ? actions(row) : (
          <>
            {onEdit && (
              <button onClick={() => onEdit(row)} className="p-2 text-gray-400 hover:text-admin-info hover:bg-blue-50 rounded-lg transition-all" title="Chỉnh sửa"><Edit2 className="h-4 w-4" /></button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(row)} className="p-2 text-gray-400 hover:text-admin-danger hover:bg-red-50 rounded-lg transition-all" title="Xóa"><Trash2 className="h-4 w-4" /></button>
            )}
            {(onDuplicate || onToggleStatus) && (
              <div className="relative">
                <button onClick={() => setOpenDropdown(openDropdown === index ? null : index)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all" title="Thêm"><MoreVertical className="h-4 w-4" /></button>
                {openDropdown === index && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-scale-up">
                      {onDuplicate && <button onClick={() => { onDuplicate(row); setOpenDropdown(null) }} className="w-full px-4 py-2.5 text-left text-[13px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Copy className="h-4 w-4 text-gray-400" />Nhân bản</button>}
                      {onToggleStatus && <button onClick={() => { onToggleStatus(row); setOpenDropdown(null) }} className="w-full px-4 py-2.5 text-left text-[13px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2">{row.active ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}{row.active ? `Ẩn ${itemTitle}` : `Hiện ${itemTitle}`}</button>}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderMobileCard = (row, index) => {
    if (customRenderMobileCard) {
      return customRenderMobileCard(row, index, renderActions);
    }

    // Generic fallback card
    return (
      <div key={row.id || index} className="p-4 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-dark-border animate-fade-in">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {hasSelection && (
                <input
                  type="checkbox"
                  checked={selectedRows.includes(row.id)}
                  onChange={(e) => onSelectRow(row.id, e.target.checked)}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded-lg focus:ring-primary-500 cursor-pointer shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                 {/* Show first column prominently if it has no render, or first column's render */}
                 <div className="font-black text-secondary-900 dark:text-white text-[15px] leading-tight line-clamp-2">
                    {columns[0].render ? columns[0].render(row[columns[0].key], row, index) : row[columns[0].key]}
                 </div>
              </div>
            </div>
            <div className="shrink-0">
               {renderActions(row, index)}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t border-gray-50 dark:border-white/5">
             {columns.slice(1).map((column) => (
               <div key={column.key} className="flex flex-col gap-1">
                  <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">{column.label}</span>
                  <div className="text-gray-900 dark:text-white font-bold text-[13px] line-clamp-2">
                     {column.render ? column.render(row[column.key], row, index) : row[column.key]}
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRow = (row, index) => (
    <div
      key={row.id || index}
      className={`grid items-center hover:bg-[#f9fafb] transition-colors min-h-[64px] border-b border-gray-100 ${rowClassName ? rowClassName(row) : ''}`}
      style={{ gridTemplateColumns: `${hasSelection ? '48px ' : ''}${showIndex ? '48px ' : ''}${columns.map(() => 'minmax(0, 1fr)').join(' ')}${hasActions ? ' 128px' : ''}` }}
    >
      {hasSelection && (
        <div className="px-6 py-4 flex justify-center">
          <input
            type="checkbox"
            checked={selectedRows.includes(row.id)}
            onChange={(e) => onSelectRow(row.id, e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
          />
        </div>
      )}
      {showIndex && (
        <div className="px-4 py-5 text-center text-[12px] font-bold text-gray-400">
          {(currentPage * pageSize + index + 1).toString().padStart(2, '0')}
        </div>
      )}
      {columns.map((column) => (
        <div key={column.key} className="px-6 py-4 text-[14px] text-gray-900">
          {column.render ? column.render(row[column.key], row, index) : row[column.key]}
        </div>
      ))}
      {hasActions && (
        <div className="px-6 py-4 whitespace-nowrap">
          {renderActions(row, index)}
        </div>
      )}
    </div>
  )

  if (data.length === 0) {
    return (
      <div className="px-6 py-24 text-center">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <EyeOff className="h-8 w-8 text-gray-300" />
          </div>
          <p className="text-[14px] font-bold text-gray-900">Không tìm thấy dữ liệu</p>
          <p className="text-muted-label mt-1">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="divide-y divide-gray-100 dark:divide-dark-border">
        {data.map(renderMobileCard)}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto custom-scrollbar" ref={containerRef}>
      <div className="min-w-full">
        <div className="grid items-center bg-gray-50/50 border-b border-gray-100" style={{ gridTemplateColumns: `${hasSelection ? '48px ' : ''}${showIndex ? '48px ' : ''}${columns.map(() => 'minmax(0, 1fr)').join(' ')}${hasActions ? ' 128px' : ''}` }}>
          {hasSelection && <div className="px-6 py-4 w-12"><input type="checkbox" checked={allSelected} onChange={(e) => onSelectAll(e.target.checked)} className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer" /></div>}
          {showIndex && <div className="px-4 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center w-12">STT</div>}
          {columns.map((column) => <div key={column.key} className={`admin-table-header ${column.sortable ? 'cursor-pointer hover:bg-gray-100/50 select-none' : ''}`} onClick={() => column.sortable && handleSort(column.key)}><div className="flex items-center gap-2">{column.label}{column.sortable && <span className="text-gray-300">{getSortIcon(column.key)}</span>}</div></div>)}
          {hasActions && <div className="admin-table-header text-center w-32">Hành động</div>}
        </div>
        {virtualized ? (
          <List height={Math.min(maxHeight, data.length * rowHeight)} itemCount={data.length} itemSize={rowHeight} width="100%">
            {({ index, style }) => <div style={style}>{renderRow(data[index], index)}</div>}
          </List>
        ) : (
          <div>{data.map(renderRow)}</div>
        )}
      </div>
    </div>
  )
}

export default memo(AdminTable)
