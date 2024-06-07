// History.jsx
import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td, Button, HStack } from '@chakra-ui/react';
import { fetchRouteHistory } from '../api';

function History({ isLogin, token, userId }) {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchRouteHistory(userId, token);
        setHistory(data);
      } catch (error) {
      }
    }

    if (isLogin) {
      fetchData();
    }
  }, [isLogin, token, userId]);

  const sortedHistory = React.useMemo(() => {
    let sortableHistory = [...history];
    if (sortConfig !== null) {
      sortableHistory.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableHistory;
  }, [history, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <Box p={4}>
      <Heading as="h1" mb={4}>Route History</Heading>
      {error && <Text color="red.500">{error}</Text>}
      {history.length > 0 ? (
        <>
          <HStack mb={4} spacing={4}>
            <Button onClick={() => requestSort('startCity')}>Sort by Start City</Button>
            <Button onClick={() => requestSort('endCity')}>Sort by End City</Button>
            <Button onClick={() => requestSort('timestamp')}>Sort by Date</Button>
          </HStack>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Start City</Th>
                <Th>End City</Th>
                <Th>Route</Th>
                <Th>Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedHistory.map((route) => (
                <Tr key={route._id}>
                  <Td>{route.startCity}</Td>
                  <Td>{route.endCity}</Td>
                  <Td>{route.shortestPath.join(' -> ')}</Td>
                  <Td>{new Date(route.timestamp).toLocaleString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      ) : (
        <Text>No route history found.</Text>
      )}
    </Box>
  );
}

export default History;
