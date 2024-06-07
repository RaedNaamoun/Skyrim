// Map.js
import React, { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';

function Map({ mapData, shortestPath, onCityClick }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapData) {
      drawMap(mapData, shortestPath);
    }
  }, [mapData, shortestPath]);

  const handleCityClick = (cityName) => {
    onCityClick(cityName);
  };

  const drawMap = (mapData, shortestPath) => {
    const mapElement = mapRef.current;
    const containerWidth = mapElement.clientWidth;
    const containerHeight = mapElement.clientHeight;
    const scale = Math.min(containerWidth / mapData.mapsizeX, containerHeight / mapData.mapsizeY);

    // Clear previous map contents if needed
    mapElement.innerHTML = '';

    // Set up cities and their labels
    mapData.cities.forEach(city => {
      const cityElement = document.createElement('div');
      cityElement.className = 'city';
      cityElement.textContent = city.name;
      cityElement.style.left = (city.positionX * scale) + 'px';
      cityElement.style.top = (city.positionY * scale) + 'px';
      cityElement.style.position = 'absolute';
      cityElement.style.transform = 'translate(-50%, -50%)';
      cityElement.style.color = 'white';
      cityElement.style.fontSize = '12px'; // Adjust the font size as needed
      cityElement.style.fontWeight = 'bold';
      cityElement.style.whiteSpace = 'nowrap'; // Prevent text from wrapping
      cityElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Background color with higher opacity for better readability
      cityElement.style.padding = '2px 8px'; // Adjust padding for better fit
      cityElement.style.borderRadius = '3px'; // Rounded corners for a cleaner look
      cityElement.style.pointerEvents = 'auto'; // Enable pointer events
      cityElement.style.cursor = 'pointer'; // Change cursor to pointer
      cityElement.addEventListener('click', () => {
        handleCityClick(city.name);
        cityElement.style.backgroundColor = "green";
      }); // Add click event listener
      mapElement.appendChild(cityElement);
    });

    // Set up all connections and shortest path connections
    if (mapData.connections) {
      mapData.connections.forEach(connection => {
        const startCity = mapData.cities.find(city => city.name === connection.parent);
        const endCity = mapData.cities.find(city => city.name === connection.child);
        if (!startCity || !endCity) return;

        const startX = startCity.positionX * scale;
        const startY = startCity.positionY * scale;
        const endX = endCity.positionX * scale;
        const endY = endCity.positionY * scale;

        const connectionElement = document.createElement('div');
        connectionElement.className = 'connection';
        connectionElement.style.width = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2) + 'px';
        connectionElement.style.transform = `rotate(${Math.atan2(endY - startY, endX - startX)}rad)`;
        connectionElement.style.position = 'absolute';
        connectionElement.style.left = startX + 'px';
        connectionElement.style.top = startY + 'px';
        connectionElement.style.borderBottom = '3px solid white'; // Add connection line style
        mapElement.appendChild(connectionElement);
      });
    }

    // Highlight the shortest path
    shortestPath.forEach((cityName, index) => {
      if (index < shortestPath.length - 1) {
        const startCity = mapData.cities.find(city => city.name === cityName);
        const endCity = mapData.cities.find(city => city.name === shortestPath[index + 1]);
        if (startCity && endCity) {
          const startX = startCity.positionX * scale;
          const startY = startCity.positionY * scale;
          const endX = endCity.positionX * scale;
          const endY = endCity.positionY * scale;

          const connectionElement = document.createElement('div');
          connectionElement.className = 'connection highlighted';
          connectionElement.style.width = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2) + 'px';
          connectionElement.style.transform = `rotate(${Math.atan2(endY - startY, endX - startX)}rad)`;
          connectionElement.style.position = 'absolute';
          connectionElement.style.left = startX + 'px';
          connectionElement.style.top = startY + 'px';
          connectionElement.style.borderBottom = '3px solid red'; // Highlighted path style
          mapElement.appendChild(connectionElement);
        }
      }
    });
  };

  return <Box ref={mapRef} id="map" w="100%" h="100%" position="relative"></Box>;
}

export default Map;
