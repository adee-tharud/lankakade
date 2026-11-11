import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import session from '../../features/auth/state/session'

export const store = configureStore({
  reducer: { session },
  devTools: import.meta.env.DEV,
})
export const useAppDispatch = useDispatch.withTypes<typeof store.dispatch>()
export const useAppSelector =
  useSelector.withTypes<ReturnType<typeof store.getState>>()
