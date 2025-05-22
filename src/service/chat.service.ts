import { supabase } from "../db/supabase";
import { sendMessage } from "./message.services";

export async function createChat(userId1: string, userId2: string): Promise<{
    success: boolean;
    error: any;
    data: any;
}> {
    try {
        const chatId = [userId1, userId2].sort().join('_');
        console.log(chatId)
        console.log(userId2)

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


        if (!msg1.success) console.error('Failed to send message from user1:', msg1.error);
        if (!msg2.success) console.error('Failed to send message from user2:', msg2.error);

        return {
            success: true,
            error: null,
            data: { chat_id: chatId },
        };
    } catch (err) {
        console.log(err)
        return {
            success: false,
            error: err,
            data: null,
        };
    }
}
