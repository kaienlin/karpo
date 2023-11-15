import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
  type IconProps
} from '@ui-kitten/components'
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs'

import HomeScreen from '../screens/Home'

const HomeIcon = (props: IconProps) => <Icon {...props} name="home-outline" />
const ArchiveIcon = (props: IconProps) => <Icon {...props} name="archive-outline" />
const PersonIcon = (props: IconProps) => <Icon {...props} name="person-outline" />

const Tab = createBottomTabNavigator()

function BottomTabBar ({ navigation, state }: BottomTabBarProps) {
  return (
    <BottomNavigation
      selectedIndex={state.index}
      onSelect={(index) => { navigation.navigate(state.routeNames[index]) }}
      style={{ paddingBottom: 25 }}
    >
      <BottomNavigationTab title="首頁" icon={HomeIcon} />
      <BottomNavigationTab title="歷史" icon={ArchiveIcon} />
      <BottomNavigationTab title="帳戶" icon={PersonIcon} />
    </BottomNavigation>
  )
}

export default function BottomTabNavigator () {
  return (
    <Tab.Navigator
      initialRouteName="HomeScreen"
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: '主畫面', headerShown: false }}
      />
      <Tab.Screen
        name="HistoryScreen"
        component={HomeScreen}
        options={{ title: '歷史' }}
      />
      <Tab.Screen
        name="AccountScreen"
        component={HomeScreen}
        options={{ title: '帳戶' }}
      />
    </Tab.Navigator>
  )
}
