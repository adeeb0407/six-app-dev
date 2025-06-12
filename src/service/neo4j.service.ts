import axios from 'axios';
import Constants from 'expo-constants';
import { AppConfigExtra } from '../constants/types/env.types';
import { logger } from './logger.service';

const { BACKEND_URL } = Constants.expoConfig?.extra as AppConfigExtra || 'https://197e-2409-4081-beb4-f3c0-1e8-f449-e4bc-83b2.ngrok-free.app/api'

export async function addConnection(userId1: string, userId2: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/users/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId1, userId2 }),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error('addConnection', `Failed to add connection: ${error}`);
    }
  } catch (err) {
    logger.error('addConnection', 'Error calling add-connection API:', err);
  }
}

export async function createUserNode(userId: string, name: string, phone: string) {
  try {
    const response = await axios(`${BACKEND_URL}/users/create-node`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: { userId, name, phone },
    });

  } catch (err) {
    logger.error('createUserNode', 'Error calling create-user-node API:', err);
  }
}

export const getConnectionDetails = async (userId1: string, userId2: string) => {

  logger.info('getConnectionDetails', `Getting connection details for ${userId1} and ${userId2}`);
  try {
    const response = await axios.post(`${BACKEND_URL}/users/connection-details`, {
     userId1, userId2
    });

    logger.info('getConnectionDetails', 'reponse of connection details:', response.data);

    if (response.status === 200) {
      return response.data;
    } else {
      logger.error('getConnectionDetails', `Failed to get connection details: ${response.statusText}`);
      return null;
    }
  }
  catch (err) {
    logger.error('getConnectionDetails', 'Error calling get-connection-details API:', err);
    return null;
  }
};
