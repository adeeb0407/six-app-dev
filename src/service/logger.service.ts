import Constants from 'expo-constants';
import type { AppConfigExtra } from '../constants/types/env.types';
import { supabase } from '../db/supabase';

interface LogEntry {
  function_name: string;
  message: string;
  details?: any;
}

class LogService {
  private isLocal: boolean;

  constructor() {
    const extra = Constants.expoConfig?.extra as AppConfigExtra;
    const LOG_ENV = extra.APP_ENV || 'local';
    this.isLocal = LOG_ENV === 'local';
  }

  private async log(functionName: string, message: string, details?: any) {
    const logEntry: LogEntry = {
      function_name: functionName,
      message,
      details: details ? JSON.stringify(details) : null,
    };

    // Always console log in local/dev
    if (this.isLocal) {
      console.log(`[${functionName}] ${message}`, details || '');
      return;
    }

    try {
      await supabase.from('logs').insert([logEntry]);
    } catch (err) {
      console.error('Failed to log to Supabase:', err);
      console.log(`[${functionName}] ${message}`, details || '');
    }
  }

  async info(functionName: string, message: string, details?: any) {
    await this.log(functionName, `INFO: ${message}`, details);
  }

  async error(functionName: string, message: string, details?: any) {
    await this.log(functionName, `ERROR: ${message}`, details);
  }

  async warn(functionName: string, message: string, details?: any) {
    await this.log(functionName, `WARN: ${message}`, details);
  }

  async debug(functionName: string, message: string, details?: any) {
    await this.log(functionName, `DEBUG: ${message}`, details);
  }
}

// Export singleton instance
export const logger = new LogService();
