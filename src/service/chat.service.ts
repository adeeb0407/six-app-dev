import axios from "axios";
import Constants from 'expo-constants';
import { AppConfigExtra } from '../constants/types/env.types';
import { logger } from "./logger.service";

const { BACKEND_URL } = Constants.expoConfig?.extra as AppConfigExtra;

export async function createChatRequest(userId1: string, userId2: string, postId: string, requestId: string): Promise<{
  success: boolean;
  error: any;
  data: any;
}> {
  try {
    const chatId = [userId1, userId2].sort().join('_');
    // create connection between users
    const { data } = await axios.post(`${BACKEND_URL}/chat/create-chat-and-intro-message`, {
      userId1,
      userId2,
      postId,
      chatId,
      postReactionId: requestId,
    });

    return {
      success: data.success,
      error: null,
      data: data.data,
    };
  } catch (error) {
    logger.error("createChat", 'Error while creating chat', error as string);
    return {
      success: false,
      error: error,
      data: null,
    };
  }
}


export async function removeChatAndConnection(userId1: string, userId2: string, chatId: string): Promise<{
  success: boolean;
  error: any;
}> {
  try {

    await axios.post(`${BACKEND_URL}/users/remove-connetion`, {
      userId1,
      userId2,
      chatId,
    });

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    logger.error("removeChatAndConnection", "Error while removing chat and connection", error as string);
    return {
      success: false,
      error,
    };
  }
}