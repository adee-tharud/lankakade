import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import { accountApi, type Customer } from '../../account/services/account-api'
import { ApiError } from '../../../services/api/request'

export const restoreSession = createAsyncThunk(
  'session/restore',
  async (_, { rejectWithValue }) => {
    try {
      return await accountApi.profile()
    } catch (error) {
      return rejectWithValue(
        error instanceof ApiError && error.status === 401
          ? 'anonymous'
          : 'unavailable',
      )
    }
  },
)

type SessionState = {
  status: 'checking' | 'authenticated' | 'anonymous' | 'unavailable'
  user: Customer | null
  requestId: string | null
}
const initialState: SessionState = {
  status: 'checking',
  user: null,
  requestId: null,
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    clearSession(state) {
      state.user = null
      state.status = 'anonymous'
      state.requestId = null
    },
    updateCustomer(state, action: PayloadAction<Customer>) {
      state.user = action.payload
      state.status = 'authenticated'
      state.requestId = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state, action) => {
        state.requestId = action.meta.requestId
        state.status = 'checking'
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.user = action.payload
        state.status = 'authenticated'
        state.requestId = null
      })
      .addCase(restoreSession.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.user = null
        state.status =
          action.payload === 'anonymous' ? 'anonymous' : 'unavailable'
        state.requestId = null
      })
  },
})
export const { clearSession, updateCustomer } = sessionSlice.actions
export default sessionSlice.reducer
