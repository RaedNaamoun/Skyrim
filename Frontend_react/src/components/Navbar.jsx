// components/Navbar.jsx
import React from 'react';
import { Box, Button, Flex, Heading, HStack } from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = ({ logout }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box bg="teal.500" p={4} color="black">
      <Flex alignItems="center" justifyContent="space-between">
        <Heading size="md">Skyrim Navigator</Heading>
        <HStack spacing={4}>
          <Link to="/">
            <Button color="black" colorScheme="teal" variant="outline">
              Home
            </Button>
          </Link>
          <Link to="/history">
            <Button color="black" colorScheme="teal" variant="outline">
              History
            </Button>
          </Link>
          <Button color="black" colorScheme="teal" variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button color="black" colorScheme="teal" variant="outline" onClick={logout}>
            Logout
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
