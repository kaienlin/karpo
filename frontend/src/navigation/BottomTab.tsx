import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { BottomNavigation, BottomNavigationTab, Icon, type IconProps } from '@ui-kitten/components'

import AccountStack from './AccountStack'
import HomeStack from './HomeStack'

const HomeIcon = (props: IconProps) => <Icon {...props} name="home-outline" />
const ArchiveIcon = (props: IconProps) => <Icon {...props} name="archive-outline" />
const PersonIcon = (props: IconProps) => <Icon {...props} name="person-outline" />

const Tab = createBottomTabNavigator()

function BottomTabBar({ navigation, state }: BottomTabBarProps) {
  return (
    <BottomNavigation
      selectedIndex={state.index}
      onSelect={(index) => {
        navigation.navigate(state.routeNames[index])
      }}
      style={{ paddingBottom: 25 }}
    >
      <BottomNavigationTab title="首頁" icon={HomeIcon} />
      <BottomNavigationTab title="歷史" icon={ArchiveIcon} />
      <BottomNavigationTab title="帳戶" icon={PersonIcon} />
    </BottomNavigation>
  )
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator initialRouteName="HomeScreen" tabBar={(props) => <BottomTabBar {...props} />}>
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{ title: '主畫面', headerShown: false }}
      />
      <Tab.Screen
        name="HistoryStack"
        component={HomeStack}
        options={{ title: '歷史', headerShown: false }}
      />
      <Tab.Screen
        name="AccountStack"
        component={AccountStack}
        options={{ title: '帳戶', headerShown: false }}
      />
    </Tab.Navigator>
  )
}
