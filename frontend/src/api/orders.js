import api from '../utils/axios'

export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders/checkout', orderData),
  getOrderByNumber: (orderNumber) => api.get(`/orders/order-number/${orderNumber}`),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getAllOrders: (params) => api.get('/orders', { params }),
  updateOrderStatus: (orderId, status) => api.put(`/admin/orders/${orderId}/status`, { status }),
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),
  cancelOrder: (orderId) => api.post(`/orders/${orderId}/cancel`),
  reorder: (orderId) => api.post(`/orders/${orderId}/reorder`),
  confirmReceipt: (orderId) => api.post(`/orders/${orderId}/confirm-receipt`),
}
