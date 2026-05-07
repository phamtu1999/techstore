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
  bulkActions,
  sortConfig,
  onSort,
  rowClassName,
  virtualized = false,
  rowHeight = 64,
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
    return (
      <div className="relative flex justify-center">
        <button 
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            setOpenDropdown(openDropdown?.index === index ? null : { index, x: rect.right, y: rect.bottom })
          }} 
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all active:scale-90"
          title="Thao tác"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {openDropdown?.index === index && (
          <>
            <div className="fixed inset-0 z-[110]" onClick={() => setOpenDropdown(null)} />
            <div 
              className="fixed mt-1 w-48 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 py-1.5 z-[120] animate-scale-up"
              style={{ 
                top: `${openDropdown.y}px`, 
                right: `${window.innerWidth - openDropdown.x}px` 
              }}
            >
              {onEdit && (
                <button onClick={() => { onEdit(row); setOpenDropdown(null) }} className="w-full px-4 py-2 text-left text-[13px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                  <Edit2 className="h-4 w-4 text-blue-500" /> Chỉnh sửa
                </button>
              )}
              {onDuplicate && (
                <button onClick={() => { onDuplicate(row); setOpenDropdown(null) }} className="w-full px-4 py-2 text-left text-[13px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                  <Copy className="h-4 w-4 text-emerald-500" /> Nhân bản
                </button>
              )}
              {onToggleStatus && (
                <button onClick={() => { onToggleStatus(row); setOpenDropdown(null) }} className="w-full px-4 py-2 text-left text-[13px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                  {row.active ? <EyeOff className="h-4 w-4 text-orange-500" /> : <Eye className="h-4 w-4 text-emerald-500" />}
                  {row.active ? `Ẩn ${itemTitle}` : `Hiện ${itemTitle}`}
                </button>
              )}
              {actions && (
                <div className="border-t border-gray-50 my-1 pt-1">
                  {actions(row, () => setOpenDropdown(null))}
                </div>
              )}
              {onDelete && (
                <button onClick={() => { onDelete(row); setOpenDropdown(null) }} className="w-full px-4 py-2 text-left text-[13px] font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors border-t border-gray-50 mt-1">
                  <Trash2 className="h-4 w-4" /> Xóa vĩnh viễn
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderRow = (row, index) => (
    <div
      key={row.id || index}
      className={`grid items-center hover:bg-gray-50/50 transition-colors border-b border-gray-100 ${rowClassName ? rowClassName(row) : ''}`}
      style={{ gridTemplateColumns: `${hasSelection ? '48px ' : ''}${showIndex ? '48px ' : ''}${Array.isArray(columns) ? columns.map(c => c.width || 'minmax(0, 1fr)').join(' ') : ''}${hasActions ? ' 80px' : ''}` }}
    >
      {hasSelection && (
        <div className="px-4 py-3 flex justify-center">
          <input
            type="checkbox"
            checked={selectedRows.includes(row.id)}
            onChange={(e) => onSelectRow(row.id, e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer transition-all active:scale-110"
          />
        </div>
      )}
      {showIndex && (
        <div className="px-2 py-3 text-center text-[12px] font-bold text-gray-400">
          {(currentPage * pageSize + index + 1).toString().padStart(2, '0')}
        </div>
      )}
      {Array.isArray(columns) && columns.map((column) => (
        <div 
          key={column.key} 
          className={`px-4 py-3 text-[13px] text-gray-900 font-medium ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}`}
        >
          {column.render ? column.render(row[column.key], row, index) : row[column.key]}
        </div>
      ))}
      {hasActions && (
        <div className="px-4 py-3">
          {renderActions(row, index)}
        </div>
      )}
    </div>
  )

  const renderMobileCard = (row, index) => {
    if (customRenderMobileCard) {
      return customRenderMobileCard(row, index, renderActions);
    }

    return (
      <div key={row.id || index} className="p-4 bg-white border-b border-gray-100 animate-fade-in">
        <div className="flex flex-col gap-3">
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
                 <div className="font-bold text-gray-900 text-[14px] leading-tight line-clamp-2">
                    {columns[0].render ? columns[0].render(row[columns[0].key], row, index) : row[columns[0].key]}
                 </div>
              </div>
            </div>
            <div className="shrink-0">
               {renderActions(row, index)}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-gray-50">
             {Array.isArray(columns) && columns.slice(1).map((column) => (
               <div key={column.key} className={`flex flex-col gap-0.5 ${column.align === 'right' ? 'items-end' : column.align === 'center' ? 'items-center' : 'items-start'}`}>
                  <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">{column.label}</span>
                  <div className="text-gray-900 font-bold text-[12px] line-clamp-2">
                     {column.render ? column.render(row[column.key], row, index) : row[column.key]}
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {hasSelection && selectedRows.length > 0 && (
        <div className="sticky top-0 z-[50] bg-primary-600 text-white px-6 py-3 flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-4">
            <span className="text-[13px] font-bold">Đã chọn {selectedRows.length} {itemTitle}</span>
            <div className="h-4 w-[1px] bg-white/20" />
            <div className="flex items-center gap-2">
              {bulkActions}
            </div>
          </div>
          <button 
            onClick={() => onSelectAll(false)}
            className="text-[12px] font-bold hover:underline"
          >
            Bỏ chọn tất cả
          </button>
        </div>
      )}

      <div className="overflow-x-auto custom-scrollbar" ref={containerRef}>
        <div className="min-w-full">
          <div 
            className="grid items-center bg-gray-50/50 border-b border-gray-100" 
            style={{ gridTemplateColumns: `${hasSelection ? '48px ' : ''}${showIndex ? '48px ' : ''}${Array.isArray(columns) ? columns.map(c => c.width || 'minmax(0, 1fr)').join(' ') : ''}${hasActions ? ' 80px' : ''}` }}
          >
            {hasSelection && (
              <div className="px-4 py-3 flex justify-center">
                <input 
                  type="checkbox" 
                  checked={allSelected} 
                  onChange={(e) => onSelectAll(e.target.checked)} 
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer transition-all active:scale-110" 
                />
              </div>
            )}
            {showIndex && (
              <div className="px-2 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">STT</div>
            )}
            {Array.isArray(columns) && columns.map((column) => (
              <div 
                key={column.key} 
                className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'} ${column.sortable ? 'cursor-pointer hover:bg-gray-100/50 select-none transition-colors' : ''}`} 
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                  {column.label}
                  {column.sortable && <span className="text-gray-300">{getSortIcon(column.key)}</span>}
                </div>
              </div>
            ))}
            {hasActions && <div className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Hành động</div>}
          </div>

          {data.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <EyeOff className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-[14px] font-bold text-gray-900">Không tìm thấy dữ liệu</p>
                <p className="text-gray-400 text-[13px] mt-1">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            </div>
          ) : isMobile ? (
            <div className="divide-y divide-gray-100">
              {data.map(renderMobileCard)}
            </div>
          ) : virtualized ? (
            <List height={Math.min(maxHeight, data.length * rowHeight)} itemCount={data.length} itemSize={rowHeight} width="100%">
              {({ index, style }) => <div style={style}>{renderRow(data[index], index)}</div>}
            </List>
          ) : (
            <div className="divide-y divide-gray-50">{data.map(renderRow)}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(AdminTable)
