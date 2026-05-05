import { Edit2, Trash2, MoreVertical, Copy, EyeOff, Eye } from 'lucide-react'
import { memo, useEffect, useMemo, useState } from 'react'

const AdminTable = ({ 
  columns, 
  data, 
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
  rowClassName
}) => {
  const [openDropdown, setOpenDropdown] = useState(null)
  const hasActions = onEdit || onDelete || actions

  useEffect(() => {
    setOpenDropdown(null)
  }, [data])
  const hasSelection = onSelectRow && onSelectAll
  const allSelected = hasSelection && data.length > 0 && selectedRows.length === data.length
  const colSpan = useMemo(
    () => columns.length + (hasActions ? 1 : 0) + (showIndex ? 1 : 0) + (hasSelection ? 1 : 0),
    [columns.length, hasActions, showIndex, hasSelection]
  )

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

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr>
            {hasSelection && (
              <th className="px-6 py-4 w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                />
              </th>
            )}
            {showIndex && (
              <th className="admin-table-header w-16">
                #
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`admin-table-header ${column.sortable ? 'cursor-pointer hover:bg-gray-100/50 select-none' : ''}`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && (
                    <span className="text-gray-300">{getSortIcon(column.key)}</span>
                  )}
                </div>
              </th>
            ))}
            {hasActions && (
              <th className="admin-table-header text-center w-32">
                Hành động
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={colSpan}
                className="px-6 py-24 text-center"
              >
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <EyeOff className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="text-[14px] font-bold text-gray-900">Không tìm thấy dữ liệu</p>
                  <p className="text-muted-label mt-1">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={index}
                className={`hover:bg-[#f9fafb] transition-colors h-[64px] ${rowClassName ? rowClassName(row) : ''}`}
              >
                {hasSelection && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={(e) => onSelectRow(row.id, e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                    />
                  </td>
                )}
                {showIndex && (
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 font-medium">
                    {currentPage * pageSize + index + 1}
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 text-[14px] text-gray-900"
                  >
                    {column.render ? column.render(row[column.key], row, index) : row[column.key]}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      {actions ? actions(row) : (
                        <>
                          {onEdit && (
                            <button
                              onClick={() => onEdit(row)}
                              className="p-2 text-gray-400 hover:text-admin-info hover:bg-blue-50 rounded-lg transition-all"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(row)}
                              className="p-2 text-gray-400 hover:text-admin-danger hover:bg-red-50 rounded-lg transition-all"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                          {(onDuplicate || onToggleStatus) && (
                            <div className="relative">
                              <button
                                onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                                title="Thêm"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {openDropdown === index && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setOpenDropdown(null)}
                                  />
                                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-scale-up">
                                    {onDuplicate && (
                                      <button
                                        onClick={() => { onDuplicate(row); setOpenDropdown(null) }}
                                        className="w-full px-4 py-2.5 text-left text-[13px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <Copy className="h-4 w-4 text-gray-400" />
                                        Nhân bản
                                      </button>
                                    )}
                                    {onToggleStatus && (
                                      <button
                                        onClick={() => { onToggleStatus(row); setOpenDropdown(null) }}
                                        className="w-full px-4 py-2.5 text-left text-[13px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        {row.active ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                                        {row.active ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}
                                      </button>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default memo(AdminTable)
