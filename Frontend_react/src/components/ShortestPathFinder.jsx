// ShortestPathFinder.jsx
import React, { useState, useEffect } from 'react';
import { Container, Heading, Text, VStack, Box } from '@chakra-ui/react';
import Map from '../Map';
import Form from '../Form';
import { fetchMapData, findShortestPath, saveRouteHistory } from '../api';

var count = 0;
var startCity="";
var endCity="";

function ShortestPathFinder({ isLogin, token, userId }) {
  const [mapData, setMapData] = useState(null);
  const [shortestPath, setShortestPath] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchMapData(token);
        setMapData(data);
      } catch (error) {
      }
    }
    if (isLogin) {
      fetchData();
    }
  }, [isLogin, token]);

  const handleSubmit = async (startCity, endCity) => {
    try {
      const result = await findShortestPath(startCity, endCity, token);
      const pathNames = result.shortestPath.map(city => city.name);
      setShortestPath(pathNames);
      setError(null);

      // Save the route history
      await saveRouteHistory(userId, startCity, endCity, pathNames, token);
    } catch (error) {
      setError('Failed to find the shortest path');
      setShortestPath([]);
    }
  };

  const handleCityClick = (cityName) => {
    if (count%2 === 0) {
      startCity=cityName;
      count++;
    } else {
      endCity=cityName;
      handleSubmit(startCity,endCity);
      count++;
    }
  };

  return (
    <>
      {isLogin && (
        <Container maxW="container.lg" mt={4}>
          <VStack spacing={4} align="stretch">
            <Heading as="h1" mb={4}>Shortest Path Finder</Heading>
            {error && <Text color="red.500">{error}</Text>}
            {mapData && <Form onSubmit={handleSubmit} cities={mapData.cities} />}
            {shortestPath.length > 0 && (
              <Text mt={4}>
                Shortest Path: {shortestPath.join(' -> ')}
              </Text>
            )}
            {mapData && <Box mt={4}><Map mapData={mapData} shortestPath={shortestPath} onCityClick={handleCityClick}/></Box>}
          </VStack>
        </Container>
      )}
    </>
  );
}

export default ShortestPathFinder;
