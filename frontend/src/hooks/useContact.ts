import { useNavigation } from '@react-navigation/native'
import * as Linking from 'expo-linking'

export const useContact = () => {
  const navigation = useNavigation()

  return {
    viewProfile: (userId: string) => {
      navigation.navigate('UserProfileScreen', { role: 'passenger', userId })
    },
    chat: (joinId: string, userId: string) => {
      navigation.navigate('ChatScreen', { joinId, user1Id: userId })
    },
    call: (phoneNumber: string) => {
      Linking.openURL(`tel:${phoneNumber}`).catch(console.log)
    }
  }
}
