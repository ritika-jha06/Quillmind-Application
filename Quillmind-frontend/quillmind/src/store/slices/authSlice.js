import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '@/api/auth'

const storedUser = JSON.parse(localStorage.getItem('qm_user') || 'null')
const storedToken = localStorage.getItem('qm_token') || null

const getErrorMessage = (err, fallback) => {
  const detail = err?.response?.data?.detail

  // FastAPI validation errors
  if (Array.isArray(detail)) {
    return detail.map(item => item.msg).join(', ')
  }

  // Normal string errors
  if (typeof detail === 'string') {
    return detail
  }

  return fallback
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await authAPI.login(credentials)
      return res.data
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, 'Login failed')
      )
    }
  }
)

export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await authAPI.adminLogin(credentials)
      return res.data
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, 'Admin login failed')
      )
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const res = await authAPI.register(data)
      return res.data
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, 'Registration failed')
      )
    }
  }
)

const authSlice = createSlice({
  name: 'auth',

  initialState: {
    user: storedUser,
    token: storedToken,
    isAdmin:
      storedUser?.role === 'admin' ||
      storedUser?.role === 'sub_admin',
    loading: false,
    error: null,
  },

  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.isAdmin = false

      localStorage.removeItem('qm_user')
      localStorage.removeItem('qm_token')
    },

    clearError(state) {
      state.error = null
    },

    setCredentials(state, { payload }) {
      state.user = payload.user
      state.token = payload.token

      state.isAdmin =
        payload.user?.role === 'admin' ||
        payload.user?.role === 'sub_admin'

      localStorage.setItem(
        'qm_user',
        JSON.stringify(payload.user)
      )

      localStorage.setItem(
        'qm_token',
        payload.token
      )
    },
  },

  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true
      state.error = null
    }

    const rejected = (state, action) => {
      state.loading = false
      state.error = action.payload
    }

    const fulfilled = (state, { payload }) => {
      state.loading = false

      state.user = payload.user || null
      state.token = payload.access_token || null

      state.isAdmin =
        payload.user?.role === 'admin' ||
        payload.user?.role === 'sub_admin'

      if (payload.user) {
        localStorage.setItem(
          'qm_user',
          JSON.stringify(payload.user)
        )
      }

      if (payload.access_token) {
        localStorage.setItem(
          'qm_token',
          payload.access_token
        )
      }
    }

    builder
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, fulfilled)
      .addCase(loginUser.rejected, rejected)

      .addCase(adminLogin.pending, pending)
      .addCase(adminLogin.fulfilled, fulfilled)
      .addCase(adminLogin.rejected, rejected)

      .addCase(registerUser.pending, pending)
      .addCase(registerUser.rejected, rejected)
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false
      })
  },
})

export const {
  logout,
  clearError,
  setCredentials,
} = authSlice.actions

export default authSlice.reducer