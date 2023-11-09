import { View, Image } from "react-native";
import { Button } from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "space-evenly" }}>
      <View style={{ alignItems: "center" }}>
        <Image
          style={{ height: 106, width: 305 }}
          source={require("../../assets/logo.png")}
        />
      </View>
      <View style={{ marginHorizontal: 40 }}>
        <View style={{ flex: 1, gap: 10 }}>
          <Button
            style={{ borderRadius: "12%" }}
            size="large"
            onPress={() => navigation.navigate("SignIn")}
          >
            登入
          </Button>
          <Button
            style={{ borderRadius: "12%" }}
            size="large"
            appearance="outline"
            onPress={() => navigation.navigate("SignUp")}
          >
            註冊
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
