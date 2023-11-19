import { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Input, Icon, Text, type IconProps } from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import { type NativeStackScreenProps } from "@react-navigation/native-stack";
import { type AuthStackParamList } from "../navigation/AuthStack";

const EmailIcon = (props: IconProps) => <Icon {...props} name="email-outline" />;
const LockIcon = (props: IconProps) => <Icon {...props} name="lock-outline" />;

type SignInScreenProps = NativeStackScreenProps<AuthStackParamList, "SignIn">;

export default function SignInScreen({ navigation }: SignInScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    validateForm();
  }, [email, password]);

  const validateForm = () => {
    let errors = {};

    // Validate email field
    if (!email) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid.";
    }

    // Validate password field
    if (!password) {
      errors.password = "Password is required.";
    }

    setIsFormValid(Object.keys(errors).length === 0);
  };

  const handleSignInPress = () => {
    if (isFormValid) {
      // TODO: request backend for auth
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 45, marginVertical: 50 }}>
        <Text category="h1">登入</Text>
      </View>
      <View style={{ paddingHorizontal: 40, gap: 30 }}>
        <View style={{ gap: 10 }}>
          <Input
            size="large"
            style={styles.input}
            placeholder="電子郵件地址"
            autoCapitalize="none"
            inputMode="email"
            accessoryLeft={EmailIcon}
            onChangeText={setEmail}
          />
          <Input
            size="large"
            style={styles.input}
            placeholder="密碼"
            autoCapitalize="none"
            accessoryLeft={LockIcon}
            secureTextEntry={true}
            onChangeText={setPassword}
          />
        </View>
        <Button
          style={{ borderRadius: 12 }}
          size="large"
          onPress={handleSignInPress}
        >
          登入
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 12,
    backgroundColor: "#FFF",
  },
});
