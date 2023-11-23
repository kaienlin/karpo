import { View, StyleSheet, TextInput } from 'react-native'
import React, { useCallback, useState } from 'react';
import { Rating } from '@kolking/react-native-rating';
import { 
  Button, 
  Card,
  Text, 
  Icon, 
  IconProps, 
  PopoverPlacements
} from '@ui-kitten/components'

const ChatIcon = (props: IconProps) => <Icon {...props} name="message-circle" />
const PhoneIcon = (props: IconProps) => <Icon {...props} name="phone" />

interface FooterProps {
  origin2route: number
  destination2route: number
}

interface CardProps {
  name: string
}


function Footer ({
  origin2route,
  destination2route
}: FooterProps) {
  return (
    <View style={{ margin: 10 }}>
      <Text style={styles.lightText}>起點 / 終點與路線最短距離： {origin2route} km / {destination2route} km</Text>
    </View>
  )
}

export default function RateCard ({
  name,
}: CardProps) {

    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>("");

    const handleChange = useCallback(
        (value: number) => setRating(Math.round((rating + value) * 5 / 10)),
        [rating],
    );

    const handleCommentChange = (text: string) => {
        setComment(text);
    };

    const handleSubmit = () => {
        if (comment.trim() !== '') {
        setComment('');
        }
    };
    return (
    <Card
      style={{ 
        // marginHorizontal: 20,
        // marginVertical: 10,
        // padding: 10, 
        elevation: 5,
        borderRadius: 12,
      }}
    >
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>與 {name} 共乘體驗如何？</Text>
        </View>

        <View style={styles.ratingContainer}>
        <Rating size={40} rating={rating} onChange={handleChange} fillColor={'#f0c414'} touchColor={'#f0c414'} />
        </View>
        <View style={styles.inputContainer}>
        <TextInput
            style={styles.input}
            placeholder="Additional comments..."
            autoCapitalize="none"
            multiline={true}
            onChangeText={handleCommentChange}
        />
        <Button
            style={styles.button}
            size="large"
            onPress={handleSubmit}
        >
            提交評價
        </Button>
        </View>
      </View>
    </Card>
  )
};

const styles = StyleSheet.create({
    
    container: {
    //   marginVertical: 30,
    //   alignItems: 'flex-start',
      backgroundColor: '#ffffff',
      borderRadius: 12,
      // padding: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },

    textContainer: {
      marginLeft: 20,
      marginBottom: 15,
    },
    text: {
      fontSize: 19,
      marginTop: 20,
    },
    ratingContainer: {
      alignItems: 'center',
    },
    inputContainer: {
      marginVertical: 15,
      marginHorizontal: 15,
      justifyContent: 'center',
    },
    input: {
      borderRadius: 8,
      backgroundColor: "#eeeef1",
      height: 140,
    //   width: 316,
      fontSize: 16,
      textAlign: 'left',
      textAlignVertical: 'top',
      fontWeight: 'normal',
      letterSpacing: 1,
      lineHeight: 22,
      padding: 15,
      paddingTop: 15,
      alignItems: 'center',
      gap: 15,
    },
    buttonContainer: {
      marginVertical: 5,
      paddingHorizontal: 40,
    },
    button: {
      marginTop: 15,
      borderRadius: 33,
      backgroundColor: '#f0c414',
      marginHorizontal: 10,
    },
    blacklist: {
      marginLeft: 220,
      backgroundColor: 'gray',
    },
    lightText: {
        color: '#5A5A5A'
      },
    });
    