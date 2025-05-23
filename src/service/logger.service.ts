import Constants from 'expo-constants';
import type { AppConfigExtra } from '../constants/types/env.types';
import { supabase } from '../db/supabase';

const extra = Constants.expoConfig?.extra as AppConfigExtra;

const LOG_ENV = extra.APP_ENV;

type LogFunction = (
  functionName: string,
  message: string,
  details?: string
) => Promise<void>;
  
export const log: LogFunction = async (
  functionName,
  message,
  details
) => {
  if (LOG_ENV === 'local') {
    console.error(`[${functionName}] ${message}`);
    return;
  }

  try {
    await supabase.from('logs').insert([
      {
        function_name: functionName,
        message,
        details,
      },
    ]);
  } catch (err) {
    console.log('Failed to log to Supabase', err);
  }
};

