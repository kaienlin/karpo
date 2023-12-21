import { StyleSheet, View } from 'react-native'
import { Text, Icon, useTheme } from '@ui-kitten/components'
import type { RideDetailInfo } from '~/types/data'

interface CardProps {
  rideInfo: RideDetailInfo,
  index: number,
  len: number
  ridePhase: number
}

export default function RideDetailCard({
  rideInfo = {} as RideDetailInfo,
  index = 0,
  len = 0,
  ridePhase= 0
}: CardProps) {
  const theme = useTheme()
  const isPastRide = index < ridePhase;
  const originalDate = new Date(rideInfo.time);
  const hours = originalDate.getUTCHours().toString().padStart(2, '0');
  const minutes = originalDate.getUTCMinutes().toString().padStart(2, '0');
  const formattedTimeString = `${hours}:${minutes}`;
  
  return (
    <View>
        <View style={isPastRide ? styles.completeRoot : styles.root}>

            <View style={styles.RideDetailContainer}>

            <View style={isPastRide ? styles.completeIconContainer : styles.iconContainer}>
                <View>
                {isPastRide ?
                    <View style={isPastRide ? styles.completeDot : styles.dot}></View>
                    :
                    <Icon name={rideInfo.iconName} style={{ width: 24, height: 24 }} fill={theme[rideInfo.iconFilledColor]} />}
                </View>
                <View>
                {index < len - 1 && (
                    <View style={isPastRide ? styles.completeVerticleLine : styles.verticleLine}></View>
                )}
                </View>
            </View>

            <View style={isPastRide ? styles.completeTextContainer : styles.TextContainer}>
                <View style={{ flex: 1, flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
                    <Text style={(index !== ridePhase) ? (isPastRide ? styles.completePassengerInfoText : styles.passengerInfoText) : styles.currentPassengerInfoText}>
                        {isPastRide ? `${rideInfo.passengerName} (${rideInfo.passengerCount}人)${rideInfo.completeType}` : `${rideInfo.type} ${rideInfo.passengerName} (${rideInfo.passengerCount}人)`}
                    </Text>
                    <Text style={(index !== ridePhase) ? (isPastRide ? styles.completeLocationText : styles.locationText) : styles.currentLocationText}>
                        {rideInfo.location}
                    </Text> 
                </View>
                <View style={{ alignItems: 'flex-end', marginRight: 30, }}>
                    <Text style={(index !== ridePhase) ? styles.completeLocationText : styles.timeText}>
                        {isPastRide ? `${formattedTimeString}${rideInfo.passengerActionType}` : `預計${formattedTimeString}${rideInfo.passengerActionType}`}
                    </Text>
                </View>
            </View>

            </View>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    root: {
      flex: 1, 
      flexDirection: 'column', 
      marginLeft: 10,
    },
    RideDetailContainer: {
      flexDirection: 'row', 
      alignItems: 'flex-start', 
      marginVertical: 10, 
      gap: 40
    },
    TextContainer: {
      flex: 1, 
      flexDirection: 'row', 
      alignItems: 'stretch',
      justifyContent: 'space-between',
    },
    completeTextContainer: {
      flex: 1, 
      flexDirection: 'row', 
      alignItems: 'stretch',
      justifyContent: 'space-between',
      marginLeft: 5, 
      },
    iconContainer: {
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 15, 
      marginLeft: 10, 
    //   marginTop: 5, 
      },
    completeIconContainer: {
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 15, 
      marginLeft: 18, 
      marginTop: 5, 
    },
    headerText: {
      fontSize: 25,
      fontWeight: 'bold',
      marginTop: 80
    },
    timeText: {
      color: '#000',
    },
    dot: {
      width: 8, 
      height: 8, 
      borderRadius: 10, 
      backgroundColor: "#F0C414",
    },
    verticleLine: {
      height: 50,
      width: 1,
      backgroundColor: "#F0C414",
      borderStyle: 'dotted',
      borderWidth: 1,
      borderRadius: 1,
      borderColor: "#F0C414",
    },
    currentPassengerInfoText: {
      fontSize: 18,
      fontWeight: 'bold'
    },
    currentLocationText: {
      color: '#CEA40E',
      fontWeight: 'bold'
    },
    passengerInfoText: {
      fontSize: 18,
      },
    locationText: {
      color: '#CEA40E',
      },
    completeDot: {
      width: 10, 
      height: 10, 
      borderRadius: 10, 
      backgroundColor: "#909090",
    },
    completeVerticleLine: {
      height: 50,
      width: 1,
      backgroundColor: "#909090",
      borderStyle: 'dotted',
      borderWidth: 1,
      borderRadius: 1,
      borderColor: "#909090",
    },
    completePassengerInfoText: {
      fontSize: 18,
      color: "#909090",
    },
    completeLocationText: {
      color: '#909090',
    },
    completeRoot: {
      flex: 1,
      flexDirection: 'column',
      marginLeft: 10,
    },
  })
  