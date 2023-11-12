import "react-native-gesture-handler";
import * as eva from "@eva-design/eva";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";

import { default as theme } from "./theme.json";
import AppNavigator from "./src/navigation";
import { store } from "./src/redux/store";

export default function App() {
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ApplicationProvider {...eva} theme={{ ...eva.light, ...theme }}>
          <SafeAreaProvider>
            <Provider store={store}>
              <AppNavigator />
            </Provider>
          </SafeAreaProvider>
        </ApplicationProvider>
      </GestureHandlerRootView>
    </>
  );
}
