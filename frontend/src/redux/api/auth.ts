import { apiSlice } from '../api'

interface AccessToken {
  accessToken: string
  tokenType: 'bearer'
}

interface UserCredentials {
  username: string
  password: string
}

interface UserRegisterFrom {
  email: string
  password: string
  name: string
  avatar?: string
}

export const authSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signIn: builder.mutation<AccessToken, UserCredentials>({
      query: ({ username, password }) => ({
        url: `/auth/cookie/login`,
        method: 'POST',
        body: {
          username,
          password
        }
      })
    }),
    signOut: builder.mutation<string, undefined>({
      query: () => ({
        url: `/auth/cookie/logout`,
        method: 'POST',
        body: {}
      })
    }),
    register: builder.mutation<AccessToken, UserRegisterFrom>({
      query: ({ email, password, name, phoneNumber, avatar }) => ({
        url: `/auth/register`,
        method: 'POST',
        body: {
          email,
          password,
          name,
          phoneNumber,
          avatar
        }
      })
    }),
    forgotPassword: builder.mutation<string, { email: string }>({
      query: ({ email }) => ({
        url: `/auth/forgot-password`,
        method: 'POST',
        body: {
          email
        }
      })
    }),
    resetPassword: builder.mutation<string, { token: string; password: string }>({
      query: ({ token, password }) => ({
        url: `/auth/reset-password`,
        method: 'POST',
        body: {
          token,
          password
        }
      })
    })
  })
})

export const {
  useSignInMutation,
  useSignOutMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation
} = authSlice
