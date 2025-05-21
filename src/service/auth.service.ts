import { AuthType } from "../constants/types/auth.types";
import { supabase } from "../db/supabase";
import { createUser } from "./user.service";

interface OTPResponse {
    success: boolean;
    error?: string;
    data?: any;
    exists?: boolean;  // Add exists flag to interface
}

export const sendOTP = async (phoneNumber: string): Promise<OTPResponse> => {
    try {
        const { data, error } = await supabase.auth.signInWithOtp({
            phone: phoneNumber,
            options: {
                
            }
        });

        if (error) {
            console.log('error message aaya h', error)
            return {
                success: false,
                error: error.message
            };
        }

        console.log('data aaya h', data)


        return {
            success: true,
            data
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send OTP'
        };
    }
};

export const verifyOTP = async (phoneNumber: string, token: string, authType: AuthType): Promise<OTPResponse> => {
    console.log('reached in the verify otp function')
    try {
        const { data, error } = await supabase.auth.verifyOtp({
            phone: phoneNumber,
            token,
            type: 'sms',
        });

        if (error) {
            return {
                success: false,
                error: error.message
            };
        }

        if (data.user?.id && data.user.phone && authType === AuthType.SignUp) {
            const result = await createUser({
                id: data.user.id,
                phone: data.user.phone
            });

            if (result.success) {
                console.log('user created successfully');
                return {
                    success: true,
                    data,
                    exists: result.exists
                };
            }
        }

        return {
            success: true,
            data,
            exists: false
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to verify OTP'
        };
    }
};

