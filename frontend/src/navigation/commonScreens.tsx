import ChatScreen from '~/screens/Chat'
import RateScreen from '~/screens/Rate'
import SelectWaypointScreen from '~/screens/SelectWaypoint'
import UserProfileScreen from '~/screens/UserProfile'

export function commonScreens(Stack) {
  return (
    <>
      <Stack.Screen
        name="SelectWaypointScreen"
        component={SelectWaypointScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RideCompleteScreen"
        component={RateScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="UserProfileScreen"
        component={UserProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
    </>
  )
}
