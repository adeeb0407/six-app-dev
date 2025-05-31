import axios from 'axios';
import Constants from 'expo-constants';
import { AuthType } from "../constants/types/auth.types";
import { AppConfigExtra } from "../constants/types/env.types";
import { supabase } from "../db/supabase";
import { log } from "./logger.service";

const BACKEND_URL = "https://47a1-103-185-242-246.ngrok-free.app/api";

interface OTPResponse {
    success: boolean;
    error?: string;
    data?: any;
    exists?: boolean;  // Add exists flag to interface
}

const { SUPABASE_URL, SUPABASE_ANON_KEY } = Constants.expoConfig?.extra as AppConfigExtra;

export const sendOTP = async (phoneNumber: string): Promise<OTPResponse> => {
    try {
        const { data, error } = await supabase.auth.signInWithOtp({
            phone: phoneNumber,
            options: {

            }
        });

        if (error) {
            log("sendOTP", 'Error while sending otp to the user', error.message);
            return {
                success: false,
                error: error.message
            };
        }

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

export const verifyOTP = async (phoneNumber: string, otp: string, authType: AuthType): Promise<OTPResponse> => {
    try {
        const body = {
            phone: phoneNumber,
            otp: otp,
            isSignup: authType === AuthType.SignUp ? true : false
        }
        console.log(body)
        const response = await axios.post(`${BACKEND_URL}/otp/verify`, body)

        console.log("refresh token", response.data.session.refresh_token);

        const { data } = await supabase.auth.setSession({
            access_token: response.data.session.access_token,
            refresh_token: response.data.session.refresh_token
        })

        return {
            success: true,
            data: response.data.user,
            exists: false
        };
    } catch (error) {
        console.log('errpr', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to verify OTP'
        };
    }
};
