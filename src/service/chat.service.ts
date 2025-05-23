import { supabase } from "../db/supabase";
import { log } from "./logger.service";
import { sendMessage } from "./message.services";

export async function createChat(userId1: string, userId2: string): Promise<{
    success: boolean;
    error: any;
    data: any;
}> {
    try {
        const chatId = [userId1, userId2].sort().join('_');

        const { data, error } = await supabase.from('chats').insert([
            {
                chat_id: chatId,
                user1: userId1,
                user2: userId2
            },
        ]);

        if (error) throw error;

        const msg1 = await sendMessage(userId1, chatId, 'Hey 👋');
        const msg2 = await sendMessage(userId2, chatId, 'Hi!');


        if (!msg1.success) log("createChat", 'Error while creating message for user 1', `userId: ${userId1}, chatId: ${chatId}, error: ${msg1.error}`);
        if (!msg2.success) log("createChat", 'Error while creating message for user 2', `userId: ${userId2}, chatId: ${chatId}, error: ${msg2.error}`);

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
