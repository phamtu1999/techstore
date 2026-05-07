import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ordersAPI } from '../../api/orders'
import { getApiErrorMessage } from '../../utils/apiError'

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.createOrder(orderData)
      return response.data
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error))
    }
  }
)

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getMyOrders(params)
      return response.data
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error))
    }
  }
)

export const fetchAllOrders = createAsyncThunk(
  'orders/fetchAllOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getAllOrders(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders')
    }
  }
)

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.updateOrderStatus(orderId, status)
      return response.data
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error))
    }
  }
)

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getOrderById(orderId)
      return response.data
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error))
    }
  }
)

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.cancelOrder(orderId)
      return response.data
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error))
    }
  }
)

export const reorderOrder = createAsyncThunk(
  'orders/reorder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.reorder(orderId)
      return response.data
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error))
    }
  }
)

export const confirmOrderReceipt = createAsyncThunk(
  'orders/confirmReceipt',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.confirmReceipt(orderId)
      return response.data
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error))
    }
  }
)

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    totalPages: 0,
    totalElements: 0,
    currentPage: 0,
    currentOrder: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentOrder = action.payload.result
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(fetchMyOrders.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.isLoading = false
        const result = action.payload.result
        console.log('Orders API Result:', result)
        if (result && typeof result === 'object' && 'content' in result) {
          state.orders = result.content
          state.totalPages = result.totalPages
          state.totalElements = result.totalElements
          state.currentPage = result.number
        } else {
          state.orders = result || []
          state.totalPages = 1
          state.totalElements = result?.length || 0
          state.currentPage = 0
        }
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(fetchAllOrders.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.isLoading = false
        const result = action.payload.result
        if (result && typeof result === 'object' && 'content' in result) {
          state.orders = result.content
          state.totalPages = result.totalPages
          state.totalElements = result.totalElements
          state.currentPage = result.number
        } else {
          state.orders = result || []
          state.totalPages = 1
          state.totalElements = result?.length || 0
          state.currentPage = 0
        }
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false
        const updatedOrder = action.payload?.result
        if (updatedOrder) {
          // Update in list
          const index = state.orders.findIndex(o => o.id === updatedOrder.id)
          if (index !== -1) {
            state.orders[index] = updatedOrder
          }
          // Update current order if it's the one being viewed
          if (state.currentOrder?.id === updatedOrder.id) {
            state.currentOrder = updatedOrder
          }
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentOrder = action.payload.result
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false
        const updatedOrder = action.payload?.result
        if (updatedOrder) {
          state.currentOrder = updatedOrder
          const index = state.orders.findIndex(o => o.id === updatedOrder.id)
          if (index !== -1) {
            state.orders[index] = updatedOrder
          }
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(reorderOrder.pending, (state) => {
        state.isLoading = true
      })
      .addCase(reorderOrder.fulfilled, (state, action) => {
        state.isLoading = false
      })
      .addCase(reorderOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(confirmOrderReceipt.pending, (state) => {
        state.isLoading = true
      })
      .addCase(confirmOrderReceipt.fulfilled, (state, action) => {
        state.isLoading = false
        const updatedOrder = action.payload?.result
        if (updatedOrder) {
          state.currentOrder = updatedOrder
          const index = state.orders.findIndex(o => o.id === updatedOrder.id)
          if (index !== -1) {
            state.orders[index] = updatedOrder
          }
        }
      })
      .addCase(confirmOrderReceipt.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = ordersSlice.actions
export default ordersSlice.reducer
