import * as Linking from 'expo-linking'

export const makePhoneCall = async (phoneNumber: string) => {
  await Linking.openURL(`tel:${phoneNumber}`)
}
