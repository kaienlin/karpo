import React, { useState } from 'react';
import { GiftedChat, IMessage, Bubble } from 'react-native-gifted-chat';
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import type {  MainStackParamList } from '~/types/navigation'
import { useCreateMessageMutation } from '~/redux/messages'

interface Reply {
    title: string
    value: string
    messageId?: any
  }
  
interface QuickReplies {
type: 'radio' | 'checkbox'
values: Reply[]
keepIt?: boolean
}
export type ChatScreenProps = NativeStackScreenProps<MainStackParamList, 'ChatScreen'>

export default function ChatScreen({ navigation }: ChatScreenProps) {
  const initialMessages: IMessage[] = [
    // example of system message
    // {
    //   _id: 0,
    //   text: 'New room created.',
    //   createdAt: new Date().getTime(),
    //   system: true,
    // },
    // example of chat message
    {
      _id: 1,
      text: 'Henlo!',
      createdAt: new Date(2023, 6, 1, 17, 20, 0),
      user: {
        _id: 2,
        name: 'Test User',
      },
    },
    {
      _id: 4,
      text: 'Hello!',
      createdAt: new Date(2023, 6, 1, 17, 19, 0),
      user: {
        _id: 1,
        name: 'User',
      },
    },
    {
      _id: 2,
      text: 'Hi!',
      createdAt: new Date(2023, 5, 11, 17, 20, 0),
      user: {
        _id: 1,
        name: 'User',
      },
    },
    {
      _id: 3,
      text: 'hihi!',
      createdAt: new Date().getTime(),
      user: {
        _id: 2,
        name: 'Test User',
      },
    },
  ];

  const [messages, setMessages] = useState<IMessage[]>( initialMessages );

  // helper method that sends a message
  const [createMessage] = useCreateMessageMutation();
  const handleSend = async (newMessage: IMessage[] = []) => {
    setMessages(GiftedChat.append(messages, newMessage));
    await createMessage({
      
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
      user={{ _id: 1 }}
    />
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
    root: {
      flex: 1,

    },
});
    
