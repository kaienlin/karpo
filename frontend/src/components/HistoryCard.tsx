import { 
    View, 
    StyleSheet, 
  } from 'react-native'
  import { 
    Button, 
    Card,
    Text, 
    Icon, 
  } from '@ui-kitten/components'

  
  interface CardProps {
    userStatus: string
    driverOrigin: string
    driverDestination: string
    departTime: string
    // onPress: (event: GestureResponderEvent) => void
  }
  
  
  export default function HistoryCard ({
    departTime,
    userStatus,
    driverOrigin,
    driverDestination,
    // onPress
  }: CardProps) {
    return (
      <Card
        style={{ 
          marginHorizontal: 20,
          marginVertical: 5,
          padding: 10, 
          elevation: 5,
          borderRadius: 10,
        }}
      >
        <View style={{
          marginHorizontal: -11,
          gap :10
        }}>
            <View>
              <Text style={{
                fontSize: 16,
                fontWeight:'bold',
              }}>
                {userStatus}行程
              </Text>
            </View>
            <View>
              <Text style={styles.lightText}>{departTime}</Text>
            </View>
          </View>
        <View style={{
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginHorizontal: -16
        }}>
          
          <View style={{
            marginTop: 7,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
              <Icon 
                name='radio-button-on' 
                style={{ width: 24, height: 24 }}
                fill={'#F0C414'}
              />
              <View style={{ marginHorizontal: 10 }}>
                <Text style={styles.lightText}>{driverOrigin}</Text>
              </View>  
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
              <Icon 
                name='pin-outline' 
                style={{ width: 24, height: 24 }}
              />
              <View style={{ marginHorizontal: 10 }}>
                <Text style={styles.lightText}>{driverDestination}</Text>
              </View>
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
            <Button
              style={{ borderRadius: 100, width: 100, height: 40 }}
              status="basic"
            >
              重新預訂
            </Button>
          </View>
        </View>
      </Card>
    )
  }

  const styles = StyleSheet.create({
    lightText: {
      color: '#5A5A5A'
    },
  });