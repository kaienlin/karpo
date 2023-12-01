import { useState } from 'react'
import { FlatList, StyleSheet, TextInput, View } from 'react-native'
import { Rating } from '@kolking/react-native-rating'
import { Button, Card, Text } from '@ui-kitten/components'

import type { User } from '~/types/data'

const templateComments = ['超級細心', '非常友善', '交到一個新朋友']

interface CardProps {
  userInfo: Pick<User, 'id' | 'name'>
  onBlacklist?: (userId: string) => void
  onSubmit?: (userId: string, rating: number, comment: string) => void
}

export default function RateCard({
  userInfo,
  onBlacklist = () => {},
  onSubmit = () => {}
}: CardProps) {
  const { id, name } = userInfo
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState<string>('')

  const handleBlacklist = () => {
    onBlacklist(id)
  }

  const handleSubmit = () => {
    if (comment.trim() !== '') {
      setComment('')
    }
    onSubmit(id, rating, comment)
  }
  return (
    <Card
      style={{
        elevation: 5,
        borderRadius: 12
      }}
      disabled={true}
    >
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>與 {name} 共乘體驗如何？</Text>
          <Button
            onPress={handleBlacklist}
            status="basic"
            size="small"
            style={{ borderRadius: 100 }}
          >
            加入黑名單
          </Button>
        </View>

        <View style={styles.ratingContainer}>
          <Rating
            size={35}
            rating={rating}
            onChange={setRating}
            fillColor={'#f0c414'}
            touchColor={'#f0c414'}
            style={{ marginBottom: -10 }}
          />
        </View>

        <View style={styles.inputContainer}>
          {/* TODO: append button text to comment */}
          <FlatList
            data={templateComments}
            horizontal={true}
            style={{ paddingVertical: 10 }}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            renderItem={({ item }) => (
              <Button size="small" appearance="outline" style={{ borderRadius: 100 }}>
                {item}
              </Button>
            )}
          />
          <TextInput
            style={styles.input}
            placeholder="留下您的建議"
            autoCapitalize="none"
            multiline={true}
            onChangeText={setComment}
          />
          <Button style={styles.button} size="large" onPress={handleSubmit}>
            提交評價
          </Button>
        </View>
      </View>
    </Card>
  )
}

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
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },

  textContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  text: {
    fontSize: 15
  },
  ratingContainer: {
    alignItems: 'center'
  },
  inputContainer: {
    marginVertical: 15,
    marginHorizontal: 15,
    justifyContent: 'center'
  },
  input: {
    borderRadius: 8,
    backgroundColor: '#eeeef1',
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
    gap: 15
  },
  buttonContainer: {
    marginVertical: 5,
    paddingHorizontal: 40
  },
  button: {
    marginTop: 15,
    borderRadius: 33
    // backgroundColor: '#f0c414',
    // marginHorizontal: 10
  },
  blacklist: {
    marginLeft: 220,
    backgroundColor: 'gray'
  },
  lightText: {
    color: '#5A5A5A'
  }
})
