import axios from 'axios';
import Constants from 'expo-constants';
import { AppConfigExtra } from '../constants/types/env.types';

const { BACKEND_URL } = Constants.expoConfig?.extra as AppConfigExtra || 'https://58af-103-185-242-167.ngrok-free.app/api'

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
      console.error(`Failed to add connection: ${error}`);
    }
  } catch (err) {
    console.error('Error calling add-connection API:', err);
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
    console.error('Error calling create-user-node API:', err);
  }
}

export const getConnectionDetails = async (userId1: string, userId2: string) => {

  console.log(`Getting connection details for ${userId1} and ${userId2}`);
  try {
    const response = await axios.post(`${BACKEND_URL}/users/connection-details`, {
     userId1, userId2
    });

    console.log('reponse of connection details:', response.data);

    if (response.status === 200) {
      return response.data;
    } else {
      console.error(`Failed to get connection details: ${response.statusText}`);
      return null;
    }
  }
  catch (err) {
    console.error('Error calling get-connection-details API:', err);
    return null;
  }
};
