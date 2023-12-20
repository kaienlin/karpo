import { forwardRef, useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Controller, useForm, type SubmitHandler } from 'react-hook-form'
import { SafeAreaView } from 'react-native-safe-area-context'
import { captureRef } from 'react-native-view-shot'
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
import Avatar, { genConfig } from '@zamplyy/react-native-nice-avatar'
import * as SecureStore from 'expo-secure-store'

import { useRegisterMutation, useSignInMutation } from '~/redux/api/auth'
import { signIn } from '~/redux/auth'
import { type UserCredentials } from '~/services/auth'
import { type SignUpScreenProps } from '~/types/screens'

const AvatarIcon = (props: IconProps) => <Icon {...props} name="person-outline" />
const EmailIcon = (props: IconProps) => <Icon {...props} name="email-outline" />
const LockIcon = (props: IconProps) => <Icon {...props} name="lock-outline" />
const ArrowForwardIcon = (props: IconProps) => <Icon {...props} name="arrow-ios-forward-outline" />

interface SignUpForm extends UserCredentials {
  name: string
  passwordConfirm: string
}

const RandomAvatar = forwardRef<View>(function RandomAvatar(_, ref) {
  const [config, setConfig] = useState(genConfig())
  const generate = () => {
    setConfig(genConfig())
  }

  return (
    <View style={{ alignItems: 'center', marginVertical: 30 }}>
      <Pressable onPress={generate}>
        <View ref={ref}>
          <Avatar size={100} {...config} />
        </View>
      </Pressable>
    </View>
  )
})

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const theme = useTheme()
  const dispatch = useDispatch()
  const avatarRef = useRef<View>(null)

  const {
    control,
    handleSubmit,
    setFocus,
    watch,
    formState: { isSubmitting }
  } = useForm<SignUpForm>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: ''
    }
  })

  const [register, { isError }] = useRegisterMutation()
  const [signInMutation] = useSignInMutation()

  const onSubmit: SubmitHandler<SignUpForm> = async data => {
    const { name, email, password } = data
    const avatar = await captureRef(avatarRef, { result: 'base64' })
    try {
      await register({ name, email, password, avatar })
      const response = await signInMutation({
        username: data.email,
        password: data.password
      }).unwrap()
      dispatch(signIn({ accessToken: response.accessToken }))
      await SecureStore.setItemAsync('accessToken', response.accessToken)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 45, alignItems: 'center' }}>
        <Text category="h1">建立帳戶</Text>
      </View>

      <RandomAvatar ref={avatarRef} />

      <View style={{ paddingHorizontal: 40, gap: 30 }}>
        {isError && (
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
            <TouchableOpacity>
              <Icon
                style={{ width: 20, height: 20 }}
                name="close-circle-outline"
                fill={theme['color-danger-900']}
              />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView style={{ gap: 10 }}>
          <Controller
            name="name"
            control={control}
            rules={{
              required: true
            }}
            render={({ field: { onChange, onBlur, value, ref }, fieldState: { invalid } }) => {
              return (
                <Input
                  testID="registerNameInput"
                  placeholder="姓名"
                  ref={ref}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={() => {
                    setFocus('email')
                  }}
                  size="large"
                  returnKeyType="next"
                  status={invalid ? 'danger' : 'basic'}
                  caption={(props: TextProps) =>
                    invalid && (
                      <View style={{ paddingLeft: 10, paddingTop: 3 }}>
                        <Text {...props}>需輸入姓名</Text>
                      </View>
                    )
                  }
                  style={styles.input}
                  inputMode="text"
                  accessoryLeft={AvatarIcon}
                  blurOnSubmit={false}
                />
              )
            }}
          />
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
                  testID="registerEmailInput"
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
                testID="registerPasswordInput"
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
              validate: value => {
                return value === watch('password')
              }
            }}
            render={({ field: { onChange, onBlur, value, ref }, fieldState: { invalid } }) => (
              <Input
                testID="registerPasswordConfirmInput"
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
        </ScrollView>
        <Button
          accessibilityLabel="註冊"
          onPress={handleSubmit(onSubmit)}
          size="large"
          disabled={isSubmitting}
          accessoryLeft={<>{isSubmitting && <Spinner status="basic" size="small" />}</>}
          accessoryRight={ArrowForwardIcon}
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
