import axios from "axios";
import { supabase } from "../db/supabase";
import { logger } from "./logger.service";
import { deleteReaction } from "./request.service";

export async function createChatRequest(userId1: string, userId2: string, postId: string, requestId: string): Promise<{
  success: boolean;
  error: any;
  data: any;
}> {
  try {
    const chatId = [userId1, userId2].sort().join('_');

    const { data: existingChat, error: checkError } = await supabase
      .from('chats')
      .select('chat_id')
      .eq('chat_id', chatId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (!existingChat) {
      const { data, error } = await supabase.from('chats').insert([
        {
          chat_id: chatId,
          user1: userId1,
          user2: userId2
        },
      ]);
      if (error) throw error;

      // create connection between users
      await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/connect`, {
        userId1: userId1,
        userId2: userId2,
      });

      await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/connect`, {
        userId1: userId2,
        userId2: userId1,
      });

    }

    await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/sixai/introduce`, {
      userId1,
      userId2,
      postId,
      chatId
    });

    await deleteReaction(requestId);

    return {
      success: true,
      error: null,
      data: { chat_id: chatId },
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

    await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/remove-connetion`, {
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