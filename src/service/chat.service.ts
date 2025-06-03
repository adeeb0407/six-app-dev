import axios from "axios";
import { supabase } from "../db/supabase";
import { log } from "./logger.service";
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
        }

        const msg = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/sixai/introduce`, {
            userId1,
            userId2,
            postId,
            chatId
        });

        deleteReaction(requestId);

        return {
            success: true,
            error: null,
            data: { chat_id: chatId },
        };
    } catch (error) {
        log("createChat", 'Error while creating chat', error as string);
        return {
            success: false,
            error: error,
            data: null,
        };
    }
}
