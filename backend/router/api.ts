// api.ts
import express, { Request, Response } from 'express';
import MapDataModel from '../model/MapDataModel'; // Import your Mongoose model
import { IMapData } from '../model/MapDataModel'; // Import the IMapData interface
import Pathfinder from '../util/Pathfinder'; // Import the Pathfinder class
import loadMapDataFromJson from '../util/JsonLoader'; // Import the loadMapDataFromJson function
import RouteHistoryModel from '../model/RouteHistoryModel'; // Import the RouteHistory model


const router = express.Router();

router.post('/routehistory', async (req: Request, res: Response) => {
  try {
    const { userId, startCity, endCity, shortestPath } = req.body;

    // Validate request data
    if (!userId || !startCity || !endCity || !shortestPath) {
      return res.status(400).json({ error: 'userId, startCity, endCity, and shortestPath are required' });
    }

    // Save the route history to the database
    const routeHistory = new RouteHistoryModel({
      userId,
      startCity,
      endCity,
      shortestPath,
      timestamp: new Date()
    });

    await routeHistory.save();

    res.status(201).json({ message: 'Route history saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/routehistory/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const history = await RouteHistoryModel.find({ userId });

    if (history.length === 0) {
      return res.status(404).json({ error: 'No route history found for this user' });
    }

    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Define a route handler to fetch map data from the database
router.get('/mapdata', async (req: Request, res: Response) => {
  try {
    // Query the database to retrieve map data
    const mapData: IMapData | null = await MapDataModel.findOne({ mapname: 'Skyrim' });

    if (!mapData) {
      return res.status(404).json({ error: 'Map data not found' });
    }

    // Send the retrieved map data as JSON response
    res.json(mapData);
  } catch (error) {
    // If an error occurs, send an error response
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/shortestpath', async (req: Request, res: Response) => {
  try {
      // Load map data from the database
      const mapData = await loadMapDataFromJson();

      // Check if map data is loaded successfully
      if (!mapData) {
          return res.status(500).json({ error: 'Failed to load map data' });
      }

      // Extract city names from query parameters
      const { start, end } = req.query;

      // Check if start and end city names are provided
      if (!start || !end) {
          return res.status(400).json({ error: 'Start and end city names are required' });
      }

      // Find the start and end cities from the map data
      const startCity = mapData.cities.find(city => city.name === start);
      const endCity = mapData.cities.find(city => city.name === end);

      // Check if start and end cities are found
      if (!startCity || !endCity) {
          return res.status(404).json({ error: 'Start or end city not found' });
      }

      // Find the shortest path between the start and end cities
      const shortestPath = Pathfinder.findShortestPath(startCity, endCity, mapData);

      // Check if a path is found
      if (shortestPath.length === 0) {
          return res.status(404).json({ error: 'No path found between the cities' });
      }

      // Send the shortest path as JSON response
      res.json({ shortestPath });
  } catch (error) {
      // If an error occurs, send an error response
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Read all cities
router.get('/cities', async (req: Request, res: Response) => {
  try {
    // Fetch the map data from the database
    const mapData = await MapDataModel.findOne({}, 'cities');

    // Extract the cities array from the map data
    const cities = mapData?.cities;

    // Return the cities array as JSON response
    res.json(cities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Read a city by name
router.get('/cities/:name', async (req: Request, res: Response) => {
  try {
      const cityName = req.params.name;

      // Fetch the city from the database by name
      const city = await MapDataModel.findOne({ 'cities.name': cityName });

      // Check if city is found
      if (!city) {
          return res.status(404).json({ error: 'City not found' });
      }

      // Extract the city object from the "cities" array
      const foundCity = city.cities.find((c) => c.name === cityName);

      // Return the city as JSON response
      res.json(foundCity);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a city by name
router.put('/cities/:name', async (req: Request, res: Response) => {
  try {
      const cityName = req.params.name;
      const { name, positionX, positionY } = req.body;

      // Find the city by name and update its properties
      const updatedCity = await MapDataModel.findOneAndUpdate(
        { mapname: 'Skyrim', 'cities.name': cityName },
        { $set: { 'cities.$.name': name, 'cities.$.positionX': positionX, 'cities.$.positionY': positionY } },
        { new: true }
      );

      // Check if city is found and updated
      if (!updatedCity) {
          return res.status(404).json({ error: 'City not found' });
      }

      // Return the updated city as JSON response
      res.json(updatedCity);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Read all connections
router.get('/connections', async (req: Request, res: Response) => {
  try {
      const existingData = await MapDataModel.findOne({ mapname: 'Skyrim' });
      if (!existingData) {
          return res.status(404).json({ error: 'Map data not found' });
      }
      res.json(existingData.connections);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Read all possible connection by name either parents/child
router.get('/connections/:name', async (req: Request, res: Response) => {
  try {
      const connectionName = req.params.name;
      const existingData = await MapDataModel.findOne({ mapname: 'Skyrim' });
      if (!existingData) {
          return res.status(404).json({ error: 'Map data not found' });
      }

      const matchingConnections = existingData.connections.filter((conn) =>
          conn.parent === connectionName || conn.child === connectionName
      );

      if (matchingConnections.length === 0) {
          return res.status(404).json({ error: 'No connections found for the specified name' });
      }

      res.json(matchingConnections);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new city
router.post('/cities', async (req: Request, res: Response) => {
  try {
    const { name, positionX, positionY } = req.body;
    
    // Validate input
    if (!name || positionX === undefined || positionY === undefined) {
      return res.status(400).json({ error: 'Missing data for new city. Name, positionX, and positionY are required.' });
    }

    // Add the new city to the map data
    const updatedMapData = await MapDataModel.findOneAndUpdate(
      { mapname: 'Skyrim' }, // Assuming 'Skyrim' is the map you are updating
      { $push: { cities: { name, positionX, positionY } } },
      { new: true, upsert: true } // upsert: true creates a new document if no document matches the filter
    );

    if (!updatedMapData) {
      return res.status(404).json({ error: 'Map data not found and could not be created' });
    }

    // Return the updated map data including the new city
    res.status(201).json(updatedMapData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST route for creating a new connection
router.post('/connections', async (req: Request, res: Response) => {
  try {
    const { parent, child } = req.body;

    // Basic validation to ensure both parent and child are provided
    if (!parent || !child) {
      return res.status(400).json({ error: 'Both parent and child cities must be provided.' });
    }

    // Here you can also add additional checks to make sure 'parent' and 'child' are existing city names if necessary

    // Add the new connection to the map data
    const updatedMapData = await MapDataModel.findOneAndUpdate(
      { mapname: 'Skyrim' }, // or another map name you want to add the connection to
      { $push: { connections: { parent, child } } },
      { new: true, upsert: true } // upsert true will create a new MapData if it doesn't exist
    );

    if (!updatedMapData) {
      return res.status(404).json({ error: 'Map data not found and could not be created.' });
    }

    // Return the updated map data with the new connection
    res.status(201).json(updatedMapData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE route for a city by name
router.delete('/cities/:name', async (req: Request, res: Response) => {
  const cityName = req.params.name;
  
  try {
    const mapData = await MapDataModel.findOneAndUpdate(
      { mapname: 'Skyrim' },
      { $pull: { cities: { name: cityName } } },
      { new: true }
    );

    if (!mapData) {
      return res.status(404).json({ error: 'Map data not found' });
    }

    res.status(200).json({
      message: `City '${cityName}' deleted successfully`,
      mapData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE route for a connection
router.delete('/connections', async (req: Request, res: Response) => {
  const { parent, child } = req.body;
  
  if (!parent || !child) {
    return res.status(400).json({ error: 'Both parent and child cities must be provided.' });
  }

  try {
    const mapData = await MapDataModel.findOneAndUpdate(
      { mapname: 'Skyrim' },
      { $pull: { connections: { parent: parent, child: child } } },
      { new: true }
    );

    if (!mapData) {
      return res.status(404).json({ error: 'Connection not found or Map data not found' });
    }

    res.status(200).json({
      message: `Connection from '${parent}' to '${child}' deleted successfully`,
      mapData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT route to update a connection
router.put('/connections', async (req: Request, res: Response) => {
  const { oldParent, oldChild, newParent, newChild } = req.body;
  
  // Validate the input
  if (!oldParent || !oldChild || !newParent || !newChild) {
    return res.status(400).json({ error: 'Both old and new parent and child cities must be provided.' });
  }

  try {
    // Update the specific connection
    const updatedMapData = await MapDataModel.findOneAndUpdate(
      { mapname: 'Skyrim', 'connections.parent': oldParent, 'connections.child': oldChild },
      { $set: { 'connections.$.parent': newParent, 'connections.$.child': newChild } },
      { new: true }
    );

    if (!updatedMapData) {
      return res.status(404).json({ error: 'Connection not found or update failed' });
    }

    res.status(200).json({
      message: `Connection updated successfully from '${oldParent}-${oldChild}' to '${newParent}-${newChild}'`,
      updatedMapData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


export default router;
