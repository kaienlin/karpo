import { Icon, TopNavigation, TopNavigationAction, type IconProps } from '@ui-kitten/components'

const BackIcon = (props: IconProps) => <Icon {...props} name="arrow-back" />
const MoreIcon = (props: IconProps) => <Icon {...props} name="more-horizontal-outline" />

interface TopNavBarProps {
  title: string
  onGoBack?: () => void
  onMore?: () => void
}

export default function TopNavBar({
  title,
  onGoBack = () => {},
  onMore = () => {}
}: TopNavBarProps) {
  return (
    <TopNavigation
      alignment="center"
      title={title}
      accessoryLeft={() => <TopNavigationAction icon={BackIcon} onPress={onGoBack} />}
      accessoryRight={() => <TopNavigationAction icon={MoreIcon} onPress={onMore} />}
    />
  )
}
