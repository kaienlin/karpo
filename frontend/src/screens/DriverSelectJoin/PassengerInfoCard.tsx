import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Shadow } from 'react-native-shadow-2'
import { Button, Divider, Text } from '@ui-kitten/components'
import { MotiView } from 'moti'
import { Skeleton } from 'moti/skeleton'

import { Avatar } from '~/components/Avatar'
import { ContactItems, LocationItem, RatingItem } from '~/components/card/CardComponents'
import { CardContainer } from '~/components/card/CardContainer'
import type { JoinDetailed } from '~/types/data'
import { displayDatetime, displayProximity } from '~/utils/format'

interface PassengerInfoCardProps {
  data: JoinDetailed
  onViewProfile: () => void
  onChat: () => void
  onCall: () => void
  onReject: () => void
  onSelect: () => void
}

export function PassengerInfoCardSkeleton() {
  const colorMode = 'light'
  const header = (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ padding: 10, paddingLeft: 0 }}>
        <Skeleton colorMode={colorMode} height={50} width={50} radius="round" />
      </View>
      <View style={{ flex: 1, justifyContent: 'space-around', paddingVertical: 8 }}>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Skeleton colorMode={colorMode} height={23} width={130} />
          </View>
          <Skeleton colorMode={colorMode} height={23} width={50} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Skeleton colorMode={colorMode} height={15} width={200} />
          </View>
        </View>
      </View>
    </View>
  )
  const body = (
    <View style={{ justifyContent: 'space-between', paddingVertical: 15, gap: 10 }}>
      <Skeleton colorMode={colorMode} height={18} width={170} />
      <Skeleton colorMode={colorMode} height={18} width={220} />
    </View>
  )
  const footer = (
    <View style={{ paddingBottom: 10 }}>
      <Skeleton colorMode={colorMode} height={30} width={330} radius="round" />
    </View>
  )

  return (
    <MotiView>
      <Shadow
        stretch={true}
        startColor="#00000010"
        containerStyle={{
          marginHorizontal: 10
        }}
      >
        <View style={{ borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }}>
          {header}
          {body}
          {footer}
        </View>
      </Shadow>
    </MotiView>
  )
}

export function PassengerInfoCard({
  data: {
    pickUpTime,
    pickUpLocation,
    dropOffLocation,
    numPassengers,
    proximity,
    fare,
    passengerInfo: { avatar, rating }
  },
  onViewProfile,
  onChat,
  onCall,
  onReject,
  onSelect
}: PassengerInfoCardProps) {
  return (
    <CardContainer>
      <View style={styles.cardHeaderContainer}>
        <TouchableOpacity
          onPress={onViewProfile}
          activeOpacity={0.8}
          style={{ padding: 10, paddingLeft: 0 }}
        >
          <Avatar base64Uri={avatar} size="small" />
        </TouchableOpacity>
        <View style={{ flex: 1, justifyContent: 'space-around', paddingVertical: 8 }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: '500' }}>
                {displayDatetime(pickUpTime, true)}
              </Text>
            </View>
            <Text style={{ fontSize: 18 }}>NT$ {fare}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <RatingItem rating={rating?.toFixed(1) ?? '5.0'} />
              <Text style={styles.lightText}>|</Text>
              <Text style={styles.lightText}>{numPassengers} 人</Text>
              <Text style={styles.lightText}>|</Text>
              <Text style={styles.lightText}>願拼車</Text>
              <Text style={styles.lightText}>|</Text>
              <Text style={{ fontSize: 12, color: '#F0C414' }}>{displayProximity(proximity)}</Text>
            </View>
          </View>
        </View>
      </View>
      <Divider />
      <View style={styles.cardBodyContainer}>
        <View style={{ gap: -3 }}>
          <LocationItem
            description={pickUpLocation.description}
            icon="radio-button-on"
            iconColor="#F0C414"
          />
          <LocationItem description={dropOffLocation.description} icon="pin" />
        </View>
        <ContactItems onChat={onChat} onCall={onCall} />
      </View>
      <Divider />
      <View style={styles.cardFooterContainer}>
        <Button onPress={onReject} status="basic" style={{ flex: 1, borderRadius: 100 }}>
          <Text>拒絕</Text>
        </Button>
        <Button onPress={onSelect} style={{ flex: 1, borderRadius: 100 }}>
          <Text>選取</Text>
        </Button>
      </View>
    </CardContainer>
  )
}

const styles = StyleSheet.create({
  lightText: {
    color: '#5A5A5A',
    fontSize: 13
  },
  cardHeaderContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  cardBodyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20
  },
  cardFooterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 15
  }
})
