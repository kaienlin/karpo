import { createSlice } from '@reduxjs/toolkit'

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userToken: null
  },
  reducers: {
    signIn: (state, action) => {
      state.userToken = action.payload.token
    },
    signOut: (state) => {
      state.userToken = null
    },
    restoreToken: (state, action) => {
      state.userToken = action.payload.token
    }
  }
})

export const { restoreToken, signIn, signOut } = authSlice.actions
export default authSlice.reducer
