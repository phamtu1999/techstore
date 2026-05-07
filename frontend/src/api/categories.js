import api from '../utils/axios'

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getAdminAll: (params) => api.get('/admin/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  getTree: () => api.get('/categories/tree'),
  delete: (id) => api.delete(`/admin/categories/${id}`),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  activateAll: () => api.post('/categories/admin/activate-all'),
  updateSortOrder: (sortRequests) => api.patch('/categories/admin/sort-order', sortRequests),
}
