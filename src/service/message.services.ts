import { ChatResponse, UserChat } from "../constants/types/message.types";
import { supabase } from "../db/supabase";
import { log } from "./logger.service";

interface MessageResponse {
    success: boolean;
    error?: string;
}

interface Message {
    id: string;
    chat_id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

interface MessagesResponse {
    success: boolean;
    data: Message[];
    error?: string;
}

export const sendMessage = async (
    currentUserId: string,
    chatId: string,
    content: string
): Promise<MessageResponse> => {
    try {
        const { error: messageError } = await supabase
            .from('messages')
            .insert([
                {
                    chat_id: chatId,
                    sender_id: currentUserId,
                    content,
                },
            ]);

        if (messageError) {
            throw new Error(`Failed to send message: ${messageError.message}`);
        }

        return { success: true };
    } catch (error) {
        log('sendMessage', 'Error sending message:', error as string);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send message'
        };
    }
};

export const fetchUserChats = async (userId: string): Promise<ChatResponse> => {
    try {
        const { data, error } = await supabase
            .rpc('get_user_chats', { p_user_id: userId });

        if (error) {
            throw new Error(`Failed to fetch chats: ${error.message}`);
        }

        console.log('chats data', data)

        return {
            success: true,
            data: data as UserChat[]
        };

    } catch (error) {
        log('fetchUserChats', 'Error fetching user chats:', error as string);
        return {
            success: false,
            data: [],
            error: error instanceof Error ? error.message : 'Failed to fetch user chats'
        };
    }
};

export const fetchChatMessages = async (chatId: string): Promise<MessagesResponse> => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at');

        if (error) {
            throw new Error(`Failed to fetch messages: ${error.message}`);
        }
        console.log(data)
        return {
            success: true,
            data: data as Message[],
            error: undefined
        };

    } catch (error) {
        log('fetchChatMessages', 'Error fetching chat messages:', error as string);
        return {
            success: false,
            data: [],
            error: error instanceof Error ? error.message : 'Failed to fetch messages'
        };
    }
};


