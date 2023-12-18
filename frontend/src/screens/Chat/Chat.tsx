import { useState, useEffect } from 'react';
import { GiftedChat, IMessage, Bubble } from 'react-native-gifted-chat';
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import type {  MainStackParamList } from '~/types/navigation'
import { useCreateMessageMutation, useGetMessageQuery } from '~/redux/messages'
import { useGetUserProfileQuery, useGetMyProfileQuery } from '~/redux/api/users'
import { Icon, TopNavigation, TopNavigationAction, type IconProps } from '@ui-kitten/components'


export type ChatScreenProps = NativeStackScreenProps<MainStackParamList, 'ChatScreen'>

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const { joinId, user1Id } = route.params
  // const joinId = 'abc'
  // const user1Id = '54321'

  const prevMessages  = useGetMessageQuery({ joinId }, { pollingInterval: 1000 })

  const { data } = useGetMyProfileQuery()
  const user1Name = useGetUserProfileQuery(user1Id).data?.name
  const [createMessage] = useCreateMessageMutation();

  const user2Id: string | number = data?.id || ''
  const user2Name = data?.name

  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    const generateMessageId = () => Math.floor(Math.random() * 1000000);
    

    if (prevMessages.data && prevMessages.data.length !== 0) {
      const prev = [...prevMessages.data];
      const sortedMessages = prev.sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      );
      
      const initialMessage = sortedMessages.map((record, index) => {
        const userId = record.userId;
        const isUser2 = userId === user2Id;
        return {
          _id: generateMessageId(),
          text: record.content,
          createdAt: new Date(record.time),
          user: {
            _id: userId,
            name: isUser2 ? user2Name : user1Name,
          },
        };
      });
      setMessages([...initialMessage]);
    }
  }, [prevMessages.data, user2Id, user2Name, user1Name]);
  

  if(data === undefined || prevMessages === undefined || user1Name === undefined){

    return(
    <SafeAreaView>
      <TopNavigation
        alignment="center"
        title="聊天室"
        accessoryLeft={() => (
          <TopNavigationAction
            icon={(props: IconProps) => <Icon {...props} name="arrow-back" />}
            onPress={() => {
              navigation.goBack()
            }
          }
          />
        )}
      />
    </SafeAreaView>)
  }

  // helper method that sends a message
  const handleSend = async (newMessage: IMessage[] = []) => {
    
    const newMessageContent = newMessage[0]?.text || "";
    await createMessage({
      joinId: joinId ?? "",
      userId: user2Id,
      content: newMessageContent,
      time: new Date()
    });
    setMessages(GiftedChat.append(messages, newMessage));
  };

  

  return (
    <SafeAreaView style={styles.root}>
      <TopNavigation
        alignment="center"
        title="聊天室"
        accessoryLeft={() => (
          <TopNavigationAction
            icon={(props: IconProps) => <Icon {...props} name="arrow-back" />}
            onPress={() => {
              navigation.goBack()
            }
          }
          />
        )}
      />
    <GiftedChat
      renderBubble={props => {
        return (
          <Bubble
            {...props}
            wrapperStyle={{
                right: {
                  backgroundColor: '#f0c414',
                },
              }}
            textStyle={{
                right: { color: 'black' }
            }}
            timeTextStyle={{
                right: { color: 'grey' }
            }}
          />
        );
      }}
      messages={messages}
      onSend={(newMessage) => handleSend(newMessage)}
      user={{ _id: user2Id,
              name: user2Name, }}
    />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    root: {
      flex: 1,

    },
});