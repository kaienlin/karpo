import { type PropsWithChildren } from 'react'
import type React from 'react'
import * as eva from '@eva-design/eva'
import { type PreloadedState } from '@reduxjs/toolkit'
import { render, type RenderOptions } from '@testing-library/react-native'
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider } from 'react-redux'

import { setupStore, type AppStore, type RootState } from '../redux/store'

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>
  store?: AppStore
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren<unknown>): JSX.Element {
    return (
      <>
        <IconRegistry icons={EvaIconsPack} />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ApplicationProvider {...eva} theme={{ ...eva.light }}>
            <Provider store={store}>{children}</Provider>
          </ApplicationProvider>
        </GestureHandlerRootView>
      </>
    )
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}
