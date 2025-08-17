import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { TextInput } from "react-native";
import { useConversation } from "@elevenlabs/react-native";
import type { ConversationStatus, ConversationEvent, Role } from "@elevenlabs/react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { nucleus } from '../Buddy_variables.js';
import { useMicrophonePermission } from '../hooks/useMicrophonePermission';

export default function ConversationScreen() {
  const { requestMicrophonePermission } = useMicrophonePermission();
  
  const conversation = useConversation({
    onConnect: ({ conversationId }: { conversationId: string }) => {
      console.log("✅ Connected to conversation", conversationId);
      setCurrentConversationId(conversationId);
    },
    onDisconnect: (details: string) => {
      console.log("❌ Disconnected from conversation", details);
      setCurrentConversationId(null);
    },
    onError: (message: string, context?: Record<string, unknown>) => {
      console.error("❌ Conversation error:", message, context);
      Alert.alert('Connection Error', message);
    },
    onMessage: ({
      message,
      source,
    }: {
      message: ConversationEvent;
      source: Role;
    }) => {
      console.log(`💬 Message from ${source}:`, message);
    },
    onModeChange: ({ mode }: { mode: "speaking" | "listening" }) => {
      console.log(`🔊 Mode: ${mode}`);
      setCurrentMode(mode);
    },
    onStatusChange: ({ status }: { status: ConversationStatus }) => {
      console.log(`📡 Status: ${status}`);
    },
    onCanSendFeedbackChange: ({
      canSendFeedback,
    }: {
      canSendFeedback: boolean;
    }) => {
      console.log(`🔊 Can send feedback: ${canSendFeedback}`);
    },
    clientTools: {
     
    }
  });

  const [isStarting, setIsStarting] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<"speaking" | "listening" | null>(null);

  const handleSubmitText = () => {
    if (textInput.trim()) {
      conversation.sendUserMessage(textInput.trim());
      setTextInput("");
      Keyboard.dismiss();
    }
  };

  const startConversation = async () => {
    if (isStarting) return;

    setIsStarting(true);
    try {
      // Request microphone permission first
      const permissionGranted = await requestMicrophonePermission();
      if (!permissionGranted) {
        Alert.alert(
          'Microphone Permission Required',
          'This app needs microphone access to enable voice conversations with AI agents.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get conversation token from your API
      const agentId = 'agent_7501k2pbpjmqe2et3qh3634a66rv';
      const tokenResponse = await fetch('/api/elevenlabs-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId }),
      });
      
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error('Token API error:', errorData);
        throw new Error(errorData.error || 'Failed to get conversation token');
      }
      
      const { token } = await tokenResponse.json();

      await conversation.startSession({
        agentId: 'agent_4701k2pazxt9fwf89szm1g9f55xv',
        conversationToken: token,
        dynamicVariables: {
          user_name: 'John Doe',
          user_activity: "starting_workout_session",
          app_context: "fitness_workout_assistant",
        }
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error("Failed to end conversation:", error);
    }
  };

  const getStatusColor = (status: ConversationStatus): string => {
    switch (status) {
      case "connected":
        return "#10B981";
      case "connecting":
        return "#F59E0B";
      case "disconnected":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: ConversationStatus): string => {
    return status[0].toUpperCase() + status.slice(1);
  };

  const canStart = conversation.status === "disconnected" && !isStarting;
  const canEnd = conversation.status === "connected";

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>ElevenLabs Conversation</Text>
        <Text style={styles.subtitle}>
          Voice AI Agent Demo
        </Text>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(conversation.status) },
            ]}
          />
          <Text style={styles.statusText}>
            {getStatusText(conversation.status)}
          </Text>
        </View>

        {/* Conversation ID Display */}
        {conversation.status === "connected" && (
          <View style={styles.conversationIdContainer}>
            <Text style={styles.conversationIdLabel}>Conversation ID:</Text>
            <Text style={styles.conversationIdText}>
              {conversation.getId() || currentConversationId || "N/A"}
            </Text>
          </View>
        )}

        {/* Speaking/Listening Indicator */}
        {conversation.status === "connected" && (
          <View style={styles.speakingContainer}>
            <View
              style={[
                styles.speakingDot,
                {
                  backgroundColor: conversation.isSpeaking
                    ? "#8B5CF6"
                    : "#10B981",
                },
              ]}
            />
            <Text
              style={[
                styles.speakingText,
                { color: conversation.isSpeaking ? "#8B5CF6" : "#10B981" },
              ]}
            >
              {conversation.isSpeaking ? "🎤 AI Speaking" : "👂 AI Listening"}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.startButton,
              !canStart && styles.disabledButton,
            ]}
            onPress={startConversation}
            disabled={!canStart}
          >
            <Text style={styles.buttonText}>
              {isStarting ? "Starting..." : "Start Conversation"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.endButton,
              !canEnd && styles.disabledButton,
            ]}
            onPress={endConversation}
            disabled={!canEnd}
          >
            <Text style={styles.buttonText}>End Conversation</Text>
          </TouchableOpacity>
        </View>

        {/* Feedback Buttons */}
        {conversation.status === "connected" &&
          conversation.canSendFeedback && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackLabel}>How was that response?</Text>
              <View style={styles.feedbackButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.likeButton]}
                  onPress={() => conversation.sendFeedback(true)}
                >
                  <Text style={styles.buttonText}>👍 Like</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.dislikeButton]}
                  onPress={() => conversation.sendFeedback(false)}
                >
                  <Text style={styles.buttonText}>👎 Dislike</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        {/* Text Input and Messaging */}
        {conversation.status === "connected" && (
          <View style={styles.messagingContainer}>
            <Text style={styles.messagingLabel}>Send Text Message</Text>
            <TextInput
              style={styles.textInput}
              value={textInput}
              onChangeText={text => {
                setTextInput(text);
                // Prevent agent from interrupting while user is typing
                if (text.length > 0) {
                  conversation.sendUserActivity();
                }
              }}
              placeholder="Type your message or context..."
              multiline
              onSubmitEditing={handleSubmitText}
              returnKeyType="send"
              blurOnSubmit={true}
            />
            <View style={styles.messageButtons}>
              <TouchableOpacity
                style={[styles.button, styles.messageButton]}
                onPress={handleSubmitText}
                disabled={!textInput.trim()}
              >
                <Text style={styles.buttonText}>💬 Send Message</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.contextButton]}
                onPress={() => {
                  if (textInput.trim()) {
                    conversation.sendContextualUpdate(textInput.trim());
                    setTextInput("");
                    Keyboard.dismiss();
                  }
                }}
                disabled={!textInput.trim()}
              >
                <Text style={styles.buttonText}>📝 Send Context</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: nucleus.light.semantic.bg.subtle,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: nucleus.light.semantic.fg.base,
  },
  subtitle: {
    fontSize: 16,
    color: nucleus.light.semantic.fg.muted,
    marginBottom: 32,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
    color: nucleus.light.semantic.fg.base,
  },
  conversationIdContainer: {
    backgroundColor: nucleus.light.semantic.bg.canvas,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: nucleus.light.semantic.border.muted,
    width: "100%",
  },
  conversationIdLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: nucleus.light.semantic.fg.muted,
    marginBottom: 4,
  },
  conversationIdText: {
    fontSize: 14,
    fontFamily: "monospace",
    color: nucleus.light.semantic.fg.base,
    backgroundColor: nucleus.light.semantic.bg.subtle,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: nucleus.light.semantic.border.muted,
  },
  speakingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  speakingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  speakingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  button: {
    backgroundColor: nucleus.light.global.blue["60"],
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
  },
  startButton: {
    backgroundColor: "#10B981",
  },
  endButton: {
    backgroundColor: "#EF4444",
  },
  disabledButton: {
    backgroundColor: nucleus.light.semantic.fg.muted,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  feedbackContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  feedbackLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: nucleus.light.semantic.fg.base,
    marginBottom: 12,
  },
  feedbackButtons: {
    flexDirection: "row",
    gap: 16,
  },
  likeButton: {
    backgroundColor: "#10B981",
  },
  dislikeButton: {
    backgroundColor: "#EF4444",
  },
  messagingContainer: {
    marginTop: 24,
    width: "100%",
  },
  messagingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: nucleus.light.semantic.fg.base,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderRadius: 8,
    padding: 16,
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: nucleus.light.semantic.border.muted,
    marginBottom: 16,
    color: nucleus.light.semantic.fg.base,
  },
  messageButtons: {
    flexDirection: "row",
    gap: 16,
  },
  messageButton: {
    backgroundColor: nucleus.light.global.blue["60"],
    flex: 1,
  },
  contextButton: {
    backgroundColor: "#4F46E5",
    flex: 1,
  },
});