import { View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icon, Text, Avatar, IconProps, Layout } from '@ui-kitten/components'


const driverInfo = {
    profilePhoto: '../../assets/riceball.jpg',
    name: '本丸',
    phone: '0912345678',
    email: 'xxxxx@gmail.com',
    rating: 4.2,
    languages: ['英語', '中文'],
    city: '台北市',
    carpoolTimes: 1500,
    joinedDays: 3,
  }


const getPhotoPath = (fileName: string): string => `../../assets/${fileName}`;

const PhoneIcon = (props: IconProps) => <Icon {...props} name="phone-outline" />

export default function DriverInfo () {
    return (
    <SafeAreaView style={{ flex: 1 }}>
        {/* header */}
        <View style={styles.header}>
            <Text style={styles.headerText}>
                駕駛資訊
            </Text>
        </View>
        {/* profile photo */}
        <View style={styles.profilePhotoContainer}>
            <Avatar
            source={require('../../assets/riceball.jpg')}
            style={{ height: 80, width: 80, }}
            size='giant'
            />
        </View>
        {/* name */}
        <View style={{ 
            marginHorizontal: 30,
            marginTop: 15, }}>
            <Text style={{
                fontSize: 38, 
                fontWeight: 'bold',
            }}>
                {driverInfo.name}
            </Text>
        </View>
        {/* basic info */}
        <View style={{ 
            marginHorizontal: 30,
            justifyContent: 'center',
            marginTop: 20,
            gap: 10,
        }}>
            <View style={styles.iconTextContainer}>
                <Layout style={styles.iconContainer}>
                    <Icon name="home-outline" fill="#000" width={20} height={20} />
                </Layout>
                <View style={{ marginHorizontal: 10 }}>
                    <Text style={styles.lightText}>{driverInfo.city}</Text>
                </View>
            </View>
            <View style={styles.iconTextContainer}>
                <Layout style={styles.iconContainer}>
                    <Icon name="phone-outline" fill="#000" width={20} height={20} />
                </Layout>
                <View style={{ marginHorizontal: 10 }}>
                    <Text style={styles.lightText}>{driverInfo.phone}</Text>
                </View>
            </View>
            <View style={styles.iconTextContainer}>
                <Layout style={styles.iconContainer}>
                    <Icon name="globe-outline" fill="#000" width={20} height={20} />
                </Layout>
                <View style={{ marginHorizontal: 10 }}>
                    <Text style={styles.lightText}>{driverInfo.languages}</Text>
                </View>
            </View>
            <View style={styles.iconTextContainer}>
                <Layout style={styles.iconContainer}>
                    <Icon name="message-circle-outline" fill="#000" width={20} height={20} />
                </Layout>
                <View style={{ marginHorizontal: 10 }}>
                    <Text style={styles.lightText}>傳訊息</Text>
                </View>
            </View>
        </View>
        {/* carpooling info */}              
        <View style={styles.carpoolInfoContainer}>
            <View style={styles.carpoolInfo}>
                <Text style={styles.yellowBoldText}>{driverInfo.carpoolTimes}</Text>
                <Text style={styles.lightText}>共乘</Text>
            </View>
            <View style={styles.carpoolInfo}>
                <Text style={styles.yellowBoldText}>
                        {driverInfo.rating}
                </Text>
                <Text style={styles.lightText}>評分</Text>
            </View>
            <View style={styles.carpoolInfo}>
                <Text style={styles.yellowBoldText}>{driverInfo.joinedDays}</Text>
                <Text style={styles.lightText}>年經驗</Text>
            </View>
        </View>
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
    header: {
        justifyContent: 'center',
          alignContent: 'center', 
          marginHorizontal: 20,
          marginTop: 20
    },

    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    profilePhotoContainer:{
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 45,
    },

    lightText: {
        color: '#5A5A5A',
        fontSize: 16
    },

    iconTextContainer: {
        flexDirection: 'row', 
        gap: 15, 
        alignItems: 'center',
        // marginTop: 2,
    },

    iconContainer: {
        width: 30, 
        height: 30, 
        borderRadius: 25, 
        backgroundColor: '#d9d9d9', 
        alignItems: 'center',
        justifyContent: 'center',
    },

    carpoolInfoContainer: {
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent:'center',
        gap: 20,
        marginTop: 40,
    },

    carpoolInfo: {
        flexDirection: 'column', 
        gap: 5, 
        alignItems: 'center',
        width: 100,
        // marginTop: 2,
    },

    yellowBoldText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#F0C414',
    },
    
});