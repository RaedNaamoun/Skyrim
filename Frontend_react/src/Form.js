// Form.js
import React, { useState } from 'react';
import { Button, FormControl, FormLabel, Select, VStack } from '@chakra-ui/react';

function Form({ onSubmit, cities }) {
  const [startCity, setStartCity] = useState('');
  const [endCity, setEndCity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(startCity, endCity);
  };

  return (
    <form onSubmit={handleSubmit} id="pathForm">
      <VStack spacing={4} align="stretch">
        <FormControl id="startCity" isRequired>
          <FormLabel>Start City</FormLabel>
          <Select value={startCity} onChange={(e) => setStartCity(e.target.value)} placeholder="Select start city">
            {cities.map(city => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </Select>
        </FormControl>
        <FormControl id="endCity" isRequired>
          <FormLabel>End City</FormLabel>
          <Select value={endCity} onChange={(e) => setEndCity(e.target.value)} placeholder="Select end city">
            {cities.map(city => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" colorScheme="teal">Find Shortest Path</Button>
      </VStack>
    </form>
  );
}

export default Form;
