import { createSlice } from '@reduxjs/toolkit'

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    accessToken: null as string | null,
    tokenType: null as string | null
  },
  reducers: {
    signIn: (state, action) => {
      state.accessToken = action.payload.accessToken
      state.tokenType = action.payload.tokenType
    },
    signOut: (state) => {
      state.accessToken = null
      state.tokenType = null
    },
    restoreToken: (state, action) => {
      state.accessToken = action.payload.accessToken
      state.tokenType = action.payload.tokenType
    }
  }
})

export const { restoreToken, signIn, signOut } = authSlice.actions
export default authSlice.reducer
