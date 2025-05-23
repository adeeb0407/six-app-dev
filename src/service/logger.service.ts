import Constants from 'expo-constants';
import { supabase } from '../db/supabase';

const APP_ENV = (Constants.expoConfig?.extra as { Appenv: string }).Appenv;

type LogLevel = 'info' | 'warn' | 'error';

export const log = async (
  functionName: string,
  message: string,
  level: LogLevel = 'info',
  details: any = {}
) => {
  if (APP_ENV === 'local') {
    console[level](`[${functionName}] ${message}`, details);
    return;
  }

  try {
    await supabase.from('logs').insert([
      {
        function_name: functionName,
        log_level: level,
        message,
        details,
      },
    ]);
  } catch (err) {
    console.error('Failed to log to Supabase', err);
  }
};
