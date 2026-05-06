import api from '../utils/axios'

export const logsAPI = {
  getLogs: (params) => api.get('/admin/system-logs', { params }),
  exportLogs: (params) => api.get('/admin/system-logs/export', { 
    params,
    responseType: 'blob' 
  })
}
