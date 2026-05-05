import api from '../utils/axios'

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getAdminAll: (params) => api.get('/admin/products', { params }),
  getAdminById: (id) => api.get(`/admin/products/${id}`),
  getById: (slug) => api.get(`/products/${slug}`),
  getByCategory: (category, params) => api.get('/products', { params: { category, ...params } }),
  search: (keyword, params) => api.get('/products', { params: { q: keyword, ...params } }),
  filterByPrice: (minPrice, maxPrice, params) => api.get('/products', { params: { minPrice, maxPrice, ...params } }),
  createProduct: (productData) => api.post('/admin/products', productData),
  updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  importExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  exportExcel: () => api.get('/admin/products/export', { responseType: 'blob' }),
}
