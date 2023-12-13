import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Controller, useForm, type SubmitHandler } from 'react-hook-form'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
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

import { useSignInMutation } from '~/redux/api/auth'
import { signIn } from '~/redux/auth'
import { type UserCredentials } from '~/services/auth'
import { type SignInScreenProps } from '~/types/screens'

const EmailIcon = (props: IconProps) => <Icon {...props} name="email-outline" />
const LockIcon = (props: IconProps) => <Icon {...props} name="lock-outline" />

const AuthFailedBox = () => {
  const theme = useTheme()
  return (
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
      <Text style={{ color: theme['color-danger-900'] }}>帳號或密碼有誤，請確認後再試</Text>
      <TouchableOpacity
        onPress={() => {
          // setIsAuthFailed(false)
        }}
      >
        <Icon
          style={{ width: 20, height: 20 }}
          name="close-circle-outline"
          fill={theme['color-danger-900']}
        />
      </TouchableOpacity>
    </View>
  )
}

export default function SignInScreen({ navigation }: SignInScreenProps) {
  const dispatch = useDispatch()

  const {
    control,
    handleSubmit,
    setFocus,
    formState: { isSubmitting }
  } = useForm<UserCredentials>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const [signInMutation, { isError }] = useSignInMutation()

  const onSubmit: SubmitHandler<UserCredentials> = async (data) => {
    try {
      const response = await signInMutation({
        username: data.email,
        password: data.password
      }).unwrap()
      dispatch(signIn({ accessToken: response.accessToken }))
      await SecureStore.setItemAsync('accessToken', response.accessToken)
    } catch (error) {
      console.log(error) // TODO: add other errors such as Network Error
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 45, marginVertical: 50 }}>
        <Text category="h1">登入</Text>
      </View>

      <View style={{ paddingHorizontal: 40, gap: 30 }}>
        {isError && <AuthFailedBox />}

        <View style={{ gap: 10 }}>
          <Controller
            name="email"
            control={control}
            rules={{
              required: true,
              pattern: /\S+@\S+\.\S+/
            }}
            render={({ field: { onChange, onBlur, value, ref }, fieldState: { invalid } }) => (
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
            )}
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
              />
            )}
          />
        </View>
        <Button
          accessibilityLabel="登入"
          onPress={handleSubmit(onSubmit)}
          size="large"
          disabled={isSubmitting}
          accessoryLeft={<>{isSubmitting && <Spinner status="basic" size="small" />}</>}
          style={{ borderRadius: 12 }}
        >
          登入
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
