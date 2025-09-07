import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Alert
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type Message = {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
};

const botResponses = [
  "Hello! I'm here to help you with any questions about child health and nutrition.",
  "That's a great question! Let me help you with that.",
  "I understand your concern. Here's what I recommend...",
  "For child health matters, it's always best to consult with your pediatrician.",
  "I'm happy to provide some general guidance on that topic.",
  "That's an important question about child development.",
  "Here are some helpful tips for that situation.",
  "Thank you for asking! Child safety is very important.",
  "I'd be glad to share some information about that.",
  "That's a common concern among parents. Here's what you should know..."
];

export default function ChatbotChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Smart Child health assistant. How can I help you today?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const onBackPress = () => {
    router.back();
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    return (
      <View style={[
        styles.messageContainer,
        item.isBot ? styles.botMessageContainer : styles.userMessageContainer
      ]}>
        {item.isBot && (
          <View style={styles.botAvatar}>
            <Ionicons name="medical" size={16} color="#4CAF50" />
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          item.isBot ? styles.botBubble : styles.userBubble
        ]}>
          <Text style={[
            styles.messageText,
            item.isBot ? styles.botText : styles.userText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.timeText,
            item.isBot ? styles.botTimeText : styles.userTimeText
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View style={[styles.messageContainer, styles.botMessageContainer]}>
        <View style={styles.botAvatar}>
          <Ionicons name="medical" size={16} color="#4CAF50" />
        </View>
        <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
          <Text style={styles.typingText}>Bot is typing...</Text>
        </View>
      </View>
    );
  };

  useEffect(() => {
    // Scroll to bottom when new message is added
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Smart Child Assistant</Text>
          <Text style={styles.headerSubtitle}>Ask me anything about child health</Text>
        </View>
      </View>

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderTypingIndicator}
      />

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#94a3b8"
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() ? "#fff" : "#94a3b8"} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },
  
  header: {
    backgroundColor: "#4CAF50",
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignSelf: 'flex-start',
  },
  
  backText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: '600',
    marginLeft: 8,
  },
  
  headerContent: {
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: "#fff",
    textAlign: 'center',
    marginBottom: 4,
  },
  
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: 'center',
  },
  
  messagesContainer: {
    padding: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  
  userMessageContainer: {
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
  },
  
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e8f5e9",
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  
  botBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#e8f5e9",
  },
  
  userBubble: {
    backgroundColor: "#4CAF50",
    borderBottomRightRadius: 4,
    marginLeft: 8,
  },
  
  typingBubble: {
    backgroundColor: "#f1f5f9",
  },
  
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  
  botText: {
    color: "#1f2937",
  },
  
  userText: {
    color: "#fff",
  },
  
  timeText: {
    fontSize: 11,
    opacity: 0.7,
  },
  
  botTimeText: {
    color: "#64748b",
  },
  
  userTimeText: {
    color: "#fff",
  },
  
  typingText: {
    fontSize: 14,
    color: "#64748b",
    fontStyle: 'italic',
  },
  
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: "#fff",
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  
  textInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    color: "#1f2937",
  },
  
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  
  sendButtonActive: {
    backgroundColor: "#4CAF50",
  },
  
  sendButtonInactive: {
    backgroundColor: "#e2e8f0",
  },
});