import { ChatResponse, UserChat } from "../constants/types/message.types";
import { supabase } from "../db/supabase";

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

        console.log('msg created ', content)
        return { success: true };
    } catch (error) {
        console.error('Error sending message:', error);
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

        return {
            success: true,
            data: data as UserChat[]
        };

    } catch (error) {
        console.error('Error in fetchUserChats:', error);
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

        return {
            success: true,
            data: data as Message[]
        };

    } catch (error) {
        console.error('Error in fetchChatMessages:', error);
        return {
            success: false,
            data: [],
            error: error instanceof Error ? error.message : 'Failed to fetch messages'
        };
    }
};


