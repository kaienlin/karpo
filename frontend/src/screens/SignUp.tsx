import { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import {
  Button,
  Icon,
  Input,
  Spinner,
  Text,
  useTheme,
  type IconProps,
  type TextProps
} from '@ui-kitten/components'
import * as SecureStore from 'expo-secure-store'
import { Controller, useForm, type SubmitHandler } from 'react-hook-form'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'

import { signIn } from '../redux/auth'
import { AuthAPI, type UserCredentials } from '../services/auth'
import { type SignUpScreenProps } from '../types/screens'

const EmailIcon = (props: IconProps) => <Icon {...props} name="email-outline" />
const LockIcon = (props: IconProps) => <Icon {...props} name="lock-outline" />

interface SignUpForm extends UserCredentials {
  passwordConfirm: string
}

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const theme = useTheme()
  const dispatch = useDispatch()

  const {
    control,
    handleSubmit,
    setFocus,
    watch,
    formState: { isSubmitting }
  } = useForm<SignUpForm>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: ''
    }
  })

  const [isAuthFailed, setIsAuthFailed] = useState(false)

  const onSubmit: SubmitHandler<SignUpForm> = async (data) => {
    try {
      const user = await AuthAPI.signUp(data)
      if (user === null || user?.token === undefined) {
        setIsAuthFailed(true)
      } else {
        dispatch(signIn({ token: user.token }))
        await SecureStore.setItemAsync('userToken', user.token)
      }
    } catch (error) {
      setIsAuthFailed(true)
      console.error(error)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 45, marginVertical: 50 }}>
        <Text category="h1">建立帳戶</Text>
      </View>

      <View style={{ paddingHorizontal: 40, gap: 30 }}>
        {isAuthFailed && (
          <View
            style={{
              height: 55,
              paddingHorizontal: 20,
              alignItems: 'center',
              borderRadius: 12,
              backgroundColor: theme['color-danger-200'],
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}
          >
            <Text style={{ color: theme['color-danger-900'] }}>註冊失敗，請稍後再試</Text>
            <TouchableOpacity
              onPress={() => {
                setIsAuthFailed(false)
              }}
            >
              <Icon
                style={{ width: 20, height: 20 }}
                name="close-circle-outline"
                fill={theme['color-danger-900']}
              />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ gap: 10 }}>
          <Controller
            name="email"
            control={control}
            rules={{
              required: true,
              pattern: /\S+@\S+\.\S+/
            }}
            render={({ field: { onChange, onBlur, value, ref }, fieldState: { invalid } }) => {
              return (
                <Input
                  placeholder="電子郵件地址"
                  ref={ref}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={() => {
                    setFocus('password')
                  }}
                  size="large"
                  returnKeyType="next"
                  status={invalid ? 'danger' : 'basic'}
                  caption={(props: TextProps) =>
                    invalid && (
                      <View style={{ paddingLeft: 10, paddingTop: 3 }}>
                        <Text {...props}>電子郵件地址格式不正確</Text>
                      </View>
                    )
                  }
                  style={styles.input}
                  autoCapitalize="none"
                  inputMode="email"
                  accessoryLeft={EmailIcon}
                  blurOnSubmit={false}
                />
              )
            }}
          />

          <Controller
            name="password"
            control={control}
            rules={{
              required: true,
              pattern: /.{6}/
            }}
            render={({ field: { onChange, onBlur, value, ref }, fieldState: { invalid } }) => (
              <Input
                placeholder="密碼"
                ref={ref}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                onSubmitEditing={() => {
                  setFocus('passwordConfirm')
                }}
                size="large"
                returnKeyType="next"
                status={invalid ? 'danger' : 'basic'}
                caption={(props: TextProps) =>
                  invalid && (
                    <View style={{ paddingLeft: 10, paddingTop: 3 }}>
                      <Text {...props}>密碼需最少六個字元</Text>
                    </View>
                  )
                }
                style={styles.input}
                autoCapitalize="none"
                accessoryLeft={LockIcon}
                secureTextEntry={true}
                blurOnSubmit={false}
              />
            )}
          />

          <Controller
            name="passwordConfirm"
            control={control}
            rules={{
              required: true,
              validate: (value) => {
                return value === watch('password')
              }
            }}
            render={({ field: { onChange, onBlur, value, ref }, fieldState: { invalid } }) => (
              <Input
                placeholder="確認密碼"
                ref={ref}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                size="large"
                returnKeyType="next"
                status={invalid ? 'danger' : 'basic'}
                caption={(props: TextProps) =>
                  invalid && (
                    <View style={{ paddingLeft: 10, paddingTop: 3 }}>
                      <Text {...props}>輸入的密碼不相符</Text>
                    </View>
                  )
                }
                style={styles.input}
                autoCapitalize="none"
                accessoryLeft={LockIcon}
                secureTextEntry={true}
              />
            )}
          />
        </View>
        <Button
          accessibilityLabel="註冊"
          onPress={handleSubmit(onSubmit)}
          size="large"
          disabled={isSubmitting}
          accessoryLeft={<>{isSubmitting && <Spinner status="basic" size="small" />}</>}
          style={{ borderRadius: 12 }}
        >
          註冊
        </Button>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 12,
    height: 60
  }
})
