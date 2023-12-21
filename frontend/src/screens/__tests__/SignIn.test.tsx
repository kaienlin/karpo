import { fireEvent, screen, waitFor } from '@testing-library/react-native'

import { AuthAPI } from '../../services/auth'
import { renderWithProviders } from '../../utils/test-utils'
import SignInScreen from '../SignIn'

jest.mock('../../services/auth', () => ({
  __esModule: true,
  AuthAPI: {
    signIn: jest.fn()
  }
}))

it('shows invalid email format message', async () => {
  renderWithProviders(<SignInScreen />)

  const emailInput = screen.getByPlaceholderText('電子郵件地址')
  fireEvent.changeText(emailInput, 'invalid@email')

  await waitFor(() => {
    expect(emailInput.props.status).toBe('danger')
    expect(screen.getByText('電子郵件地址格式不正確')).toBeOnTheScreen()
  })
})

it('shows invalid password format message', async () => {
  renderWithProviders(<SignInScreen />)

  const passwordInput = screen.getByPlaceholderText('密碼')
  fireEvent.changeText(passwordInput, 'p')

  await waitFor(() => {
    expect(passwordInput.props.status).toBe('danger')
    expect(screen.getByText('密碼需最少六個字元')).toBeOnTheScreen()
  })
})

it('does nothing when pressing login button given invalid email or invalid password', async () => {
  renderWithProviders(<SignInScreen />)

  const emailInput = screen.getByPlaceholderText('電子郵件地址')
  const passwordInput = screen.getByPlaceholderText('密碼')
  const signInButton = screen.getByLabelText('登入')

  fireEvent.changeText(emailInput, 'invalid@email')
  fireEvent.press(signInButton)

  await waitFor(() => {
    expect(AuthAPI.signIn).not.toHaveBeenCalled()
  })

  fireEvent.changeText(emailInput, '')
  fireEvent.changeText(passwordInput, 'p')
  fireEvent.press(signInButton)
  await waitFor(() => {
    expect(AuthAPI.signIn).not.toHaveBeenCalled()
  })
})

it('shows auth error message given non-registered email or incorrect password', async () => {
  AuthAPI.signIn.mockImplementation(() => null)
  renderWithProviders(<SignInScreen />)

  const emailInput = screen.getByPlaceholderText('電子郵件地址')
  const passwordInput = screen.getByPlaceholderText('密碼')
  const signInButton = screen.getByLabelText('登入')

  fireEvent.changeText(emailInput, 'user@example.com')
  fireEvent.changeText(passwordInput, 'password')
  fireEvent.press(signInButton)

  await waitFor(() => {
    expect(screen.getByText('帳號或密碼有誤，請確認後再試')).toBeOnTheScreen()
  })
})

it('allows user to login with valid email and valid password', async () => {
  AuthAPI.signIn.mockImplementation(() => ({ token: 'dummy-token' }))
  renderWithProviders(<SignInScreen />)

  const emailInput = screen.getByPlaceholderText('電子郵件地址')
  const passwordInput = screen.getByPlaceholderText('密碼')
  const signInButton = screen.getByLabelText('登入')

  fireEvent.changeText(emailInput, 'user@example.com')
  fireEvent.changeText(passwordInput, 'password')
  fireEvent.press(signInButton)

  await waitFor(() => {
    expect(screen.queryByText('帳號或密碼有誤，請確認後再試')).toBeNull()
  })
})
