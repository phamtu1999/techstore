import Swal from 'sweetalert2'
import { getApiErrorMessage } from './apiError'

export const fireError = (error, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.', title = 'Lỗi') => {
  return Swal.fire({
    title,
    text: getApiErrorMessage(error, fallback),
    icon: 'error',
  })
}

export const fireSuccess = (title, content, options = {}) => {
  return Swal.fire({
    title,
    html: content,
    icon: 'success',
    ...options,
  })
}
