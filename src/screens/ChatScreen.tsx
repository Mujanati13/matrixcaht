import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList, ChatMessage } from '../types';
import MatrixService from '../services/MatrixService';
import { COLORS, FONTS, FONT_SIZES, SPACING, generateAvatar, getInitials } from '../utils/helpers';

type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;
type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface Props {
  navigation: ChatScreenNavigationProp;
  route: ChatScreenRouteProp;
}

const ChatScreen: React.FC<Props> = ({ navigation, route }) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { roomId, roomName } = route.params;
  const currentUser = {
    _id: MatrixService.getCurrentUserId() || '1',
    name: 'You',
    avatar: undefined,
  };

  useEffect(() => {
    navigation.setOptions({
      title: roomName,
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => Alert.alert('Room Info', 'Room information coming soon')}
        >
          <Icon name="info" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      ),
    });

    loadMessages();
  }, [roomId, roomName, navigation]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      // For now, load some demo messages
      const demoMessages: IMessage[] = [
        {
          _id: '1',
          text: 'Hello! Welcome to MatrixChat. This is a secure end-to-end encrypted conversation.',
          createdAt: new Date(),
          user: {
            _id: '2',
            name: 'MatrixBot',
            avatar: undefined,
          },
        },
        {
          _id: '2',
          text: 'Your messages are protected with military-grade encryption.',
          createdAt: new Date(Date.now() - 60000),
          user: {
            _id: '2',
            name: 'MatrixBot',
            avatar: undefined,
          },
        },
      ];
      
      setMessages(demoMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const onSend = useCallback(async (messages: IMessage[] = []) => {
    try {
      const newMessage = messages[0];
      
      // Add message to UI immediately
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, messages)
      );

      // Send to Matrix
      await MatrixService.sendMessage(roomId, newMessage.text);
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message');
      
      // Remove message from UI if sending failed
      setMessages(previousMessages =>
        previousMessages.filter(msg => msg._id !== messages[0]._id)
      );
    }
  }, [roomId]);

  const renderAvatar = (props: any) => {
    const { currentMessage } = props;
    const user = currentMessage.user;
    const avatarColor = generateAvatar(user.name);
    const initials = getInitials(user.name);

    return (
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  };

  const renderBubble = (props: any) => {
    const { currentMessage } = props;
    const isCurrentUser = currentMessage.user._id === currentUser._id;

    return (
      <View style={[
        styles.bubble,
        isCurrentUser ? styles.bubbleRight : styles.bubbleLeft
      ]}>
        <Text style={[
          styles.messageText,
          isCurrentUser ? styles.messageTextRight : styles.messageTextLeft
        ]}>
          {currentMessage.text}
        </Text>
        <Text style={[
          styles.timeText,
          isCurrentUser ? styles.timeTextRight : styles.timeTextLeft
        ]}>
          {new Date(currentMessage.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <View style={styles.inputContainer}>
        <View style={styles.inputToolbar}>
          <TouchableOpacity style={styles.attachButton}>
            <Icon name="attach-file" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
          {props.renderComposer()}
          {props.renderSend()}
        </View>
      </View>
    );
  };

  const renderSend = (props: any) => {
    return (
      <TouchableOpacity
        style={styles.sendButton}
        onPress={() => {
          if (props.text && props.text.trim().length > 0) {
            props.onSend({ text: props.text.trim() }, true);
          }
        }}
      >
        <Icon name="send" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={currentUser}
        renderAvatar={renderAvatar}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        placeholder="Type a secure message..."
        showUserAvatar={true}
        alwaysShowSend={true}
        scrollToBottom={true}
        isLoadingEarlier={isLoading}
        minInputToolbarHeight={60}
        textInputStyle={styles.textInput}
        messagesContainerStyle={styles.messagesContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  messagesContainer: {
    backgroundColor: COLORS.background,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  avatarText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.background,
  },
  bubble: {
    maxWidth: '80%',
    padding: SPACING.sm,
    margin: SPACING.xs,
    borderRadius: 18,
  },
  bubbleLeft: {
    backgroundColor: COLORS.surface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  messageTextLeft: {
    color: COLORS.text,
  },
  messageTextRight: {
    color: COLORS.background,
  },
  timeText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    marginTop: SPACING.xs,
  },
  timeTextLeft: {
    color: COLORS.textSecondary,
  },
  timeTextRight: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  inputToolbar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 60,
  },
  attachButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  textInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.sm,
    maxHeight: 100,
  },
  sendButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
});

export default ChatScreen;
