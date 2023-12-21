import '@testing-library/react-native/extend-expect'

import { fireEvent, screen, waitFor } from '@testing-library/react-native'

import { AuthAPI } from '../../services/auth'
import { renderWithProviders } from '../../utils/test-utils'
import SignUpScreen from '../SignUp'

jest.mock('../../services/auth', () => ({
  __esModule: true,
  AuthAPI: {
    signUp: jest.fn()
  }
}))

it('shows invalid email format message', async () => {
  renderWithProviders(<SignUpScreen />)

  const emailInput = screen.getByPlaceholderText('電子郵件地址')
  fireEvent.changeText(emailInput, 'invalid@email')

  await waitFor(() => {
    expect(emailInput.props.status).toBe('danger')
    expect(screen.getByText('電子郵件地址格式不正確')).toBeOnTheScreen()
  })
})

it('shows invalid password format message', async () => {
  renderWithProviders(<SignUpScreen />)

  const passwordInput = screen.getByPlaceholderText('密碼')
  fireEvent.changeText(passwordInput, 'p')

  await waitFor(() => {
    expect(passwordInput.props.status).toBe('danger')
    expect(screen.getByText('密碼需最少六個字元')).toBeOnTheScreen()
  })
})

it('shows invalid password confirm format message', async () => {
  renderWithProviders(<SignUpScreen />)

  const passwordInput = screen.getByPlaceholderText('確認密碼')
  fireEvent.changeText(passwordInput, 'p')

  await waitFor(() => {
    expect(passwordInput.props.status).toBe('danger')
    expect(screen.getByText('輸入的密碼不相符')).toBeOnTheScreen()
  })
})

it('does nothing when pressing login button given at least one invalid input field', async () => {
  renderWithProviders(<SignUpScreen />)

  const inputs = screen.getAllByTestId('@undefined/input')
  const signUpButton = screen.getByLabelText('註冊')

  for (const input of inputs) {
    fireEvent.changeText(input, 'test')
    fireEvent.press(signUpButton)

    await waitFor(() => {
      expect(AuthAPI.signUp).not.toHaveBeenCalled()
    })

    fireEvent.changeText(input, '')
  }
})

it('shows sign up failed message', async () => {
  AuthAPI.signUp.mockImplementation(() => null)
  renderWithProviders(<SignUpScreen />)

  const emailInput = screen.getByPlaceholderText('電子郵件地址')
  const passwordInput = screen.getByPlaceholderText('密碼')
  const passwordConfirmInput = screen.getByPlaceholderText('確認密碼')
  const signUpButton = screen.getByLabelText('註冊')

  fireEvent.changeText(emailInput, 'user@example.com')
  fireEvent.changeText(passwordInput, 'password')
  fireEvent.changeText(passwordConfirmInput, 'password')
  fireEvent.press(signUpButton)

  await waitFor(() => {
    expect(screen.getByText('註冊失敗，請稍後再試')).toBeOnTheScreen()
  })
})

it('shows sign up success message', async () => {
  AuthAPI.signUp.mockImplementation(() => ({ token: 'dummy-token' }))
  renderWithProviders(<SignUpScreen />)

  const emailInput = screen.getByPlaceholderText('電子郵件地址')
  const passwordInput = screen.getByPlaceholderText('密碼')
  const passwordConfirmInput = screen.getByPlaceholderText('確認密碼')
  const signUpButton = screen.getByLabelText('註冊')

  fireEvent.changeText(emailInput, 'user@example.com')
  fireEvent.changeText(passwordInput, 'password')
  fireEvent.changeText(passwordConfirmInput, 'password')
  fireEvent.press(signUpButton)

  await waitFor(() => {
    expect(screen.queryByText('註冊失敗，請稍後再試')).toBeNull()
  })
})
