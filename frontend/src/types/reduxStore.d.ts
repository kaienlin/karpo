import { type store } from '../redux/store'

type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch
