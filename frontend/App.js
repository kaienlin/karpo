import 'react-native-gesture-handler'

import * as eva from '@eva-design/eva'
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'

import { default as mapping } from './src/mapping.json'
import AppNavigator from './src/navigation'
import { store } from './src/redux/store'
import { default as theme } from './theme.json'

export default function App() {
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ApplicationProvider {...eva} customMapping={mapping} theme={{ ...eva.light, ...theme }}>
          <SafeAreaProvider>
            <Provider store={store}>
              <AppNavigator />
            </Provider>
          </SafeAreaProvider>
        </ApplicationProvider>
      </GestureHandlerRootView>
    </>
  )
}
