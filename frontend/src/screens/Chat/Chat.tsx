import { useState } from 'react';
import { GiftedChat, IMessage, Bubble } from 'react-native-gifted-chat';
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import type {  MainStackParamList } from '~/types/navigation'
import { useCreateMessageMutation, useGetMessageQuery } from '~/redux/messages'
import { useGetUserProfileQuery, useGetMyProfileQuery } from '~/redux/api/users'

export type ChatScreenProps = NativeStackScreenProps<MainStackParamList, 'ChatScreen'>

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const { joinId } = route.params
  // const joinId = 'abc'
  const { data } = useGetMyProfileQuery()
  const user2Id: string | number = data?.id || ''
  const user2Name = data?.name
  // console.log(data?.name)

  const prevMessages  = useGetMessageQuery({joinId})
  
  let user1Name: string | undefined = "";
  const uniqueUserIds = [...new Set(prevMessages.data.map(item => item.userId))];
  for (const id of uniqueUserIds) {
    if (id === user2Id) {
      const { data } = useGetUserProfileQuery(id);
      user1Name = data?.name
    }
  }
  const generateMessageId = () => Math.floor(Math.random() * 1000000);
  const initialMessages: IMessage[] = prevMessages.data.map((record, index) => {
    const userId = record.userId;
    const isUser2 = userId === user2Id;
    
  
    return {
      _id: generateMessageId(),
      text: record.content,
      createdAt: record.time,
      user: {
        _id: userId,
        name: isUser2 ? user2Name : user1Name,
      },
    };
  });
  console.log(initialMessages)
  

  const [createMessage] = useCreateMessageMutation();
  
  const [messages, setMessages] = useState<IMessage[]>( initialMessages );

  // helper method that sends a message
  const handleSend = async (newMessage: IMessage[] = []) => {
    setMessages(GiftedChat.append(messages, newMessage));
    const newMessageContent = newMessage[0]?.text || "";
    await createMessage({
      joinId: joinId ?? "",
      userId: user2Id,
      content: newMessageContent,
      time: new Date()
    });
  };
  


  return (
    <SafeAreaView style={styles.root}>
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
    
