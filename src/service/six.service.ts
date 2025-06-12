import axios from "axios";
import { logger } from "./logger.service";

export const fetchPostSuggestion = async (keyword_summary: string[]): Promise<any> => {
  try {
    const { data } = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/sixai/suggestion`, {
        keyword_summary
    })
    return {
      success: true,
      data: data.data,
    };

  } catch (error) {
    logger.error('fetchPostSuggestion', 'Error fetching post suggestion:', error as string);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch suggestion'
    };
  }
};