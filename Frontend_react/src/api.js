import axios from 'axios';

export async function fetchMapData(token) {
  try {
    const response = await axios.get('http://localhost:3001/api/mapdata', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch map data');
  }
}

export async function findShortestPath(startCity, endCity, token) {
  try {
    const response = await axios.get(`https://api.group4.proxy.devops-pse.users.h-da.cloud/api/shortestpath`, {
      params: {
        start: startCity,
        end: endCity,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to find the shortest path');
  }
}

export const saveRouteHistory = async (userId, startCity, endCity, shortestPath, token) => {
  try {
    const response = await axios.post('http://localhost:3001/api/routehistory', {
      userId,
      startCity,
      endCity,
      shortestPath
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error.response?.data?.error || 'Failed to save route history');
  }
};

export async function fetchRouteHistory(userId, token) {
  try {
    const response = await axios.get(`http://localhost:3001/api/routehistory/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch route history');
  }
}