import axiosInstance from './axiosInstance'

export interface UserCredentials {
  email: string
  password: string
}

export const AuthAPI = {
  signIn: async (credentials: UserCredentials) => {
    const { data } = await axiosInstance.post('/auth/verify', credentials)
    return data
  },
  signUp: async (credentials: UserCredentials) => {
    const { data } = await axiosInstance.post('/auth/register', credentials)
    return data
  },
  signOut: async () => {
    throw new Error('Not implemented')
  },
  forgotPassword: async () => {
    throw new Error('Not implemented')
  },
  resetPassword: async () => {
    throw new Error('Not implemented')
  },
  refreshToken: async () => {
    throw new Error('Not implemented')
  }
}
