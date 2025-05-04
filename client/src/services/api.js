import axios from 'axios';

const API_URL = '/api'; 

const getTimestamp = () => `_t=${new Date().getTime()}`;

export const getAllGames = async () => {
  try {
    const response = await axios.get(`${API_URL}/games?${getTimestamp()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
};

export const getGameById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/games/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching game ${id}:`, error);
    throw error;
  }
};

export const addGame = async (gameData) => {
  try {
    const response = await axios.post(`${API_URL}/games/add`, gameData);
    return response.data;
  } catch (error) {
    console.error('Error adding game:', error);
    throw error;
  }
};

export const removeGame = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/games/remove/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing game ${id}:`, error);
    throw error;
  }
};

export const toggleGameRating = async (id) => {
  try {
    const response = await axios.patch(`${API_URL}/games/toggle-rating/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error toggling game rating ${id}:`, error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users?${getTimestamp()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw error;
  }
};

export const addUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users/add`, userData);
    return response.data;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

export const removeUser = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/users/remove/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing user ${id}:`, error);
    throw error;
  }
};

export const rateGame = async (userId, gameId, ratingData) => {
  try {
    const response = await axios.post(`${API_URL}/users/rate/${userId}/${gameId}`, ratingData);
    return response.data;
  } catch (error) {
    console.error(`Error rating game ${gameId}:`, error);
    throw error;
  }
};

export const playGame = async (userId, gameId, playTimeData) => {
  try {
    const response = await axios.post(`${API_URL}/users/play/${userId}/${gameId}`, playTimeData);
    return response.data;
  } catch (error) {
    console.error(`Error playing game ${gameId}:`, error);
    throw error;
  }
};

export const commentOnGame = async (userId, gameId, commentData) => {
  try {
    const response = await axios.post(`${API_URL}/users/comment/${userId}/${gameId}`, commentData);
    return response.data;
  } catch (error) {
    console.error(`Error commenting on game ${gameId}:`, error);
    throw error;
  }
};
