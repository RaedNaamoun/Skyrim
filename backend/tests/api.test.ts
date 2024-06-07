import request from 'supertest';
import express from 'express';
import router from '../router/api'; // Assuming your API router is named 'api.ts'
import MapDataModel from '../model/MapDataModel'; // Import your Mongoose model
import loadMapDataFromJson  from '../util/JsonLoader'; 
import RouteHistoryModel from '../model/RouteHistoryModel';
import Pathfinder from '../util/Pathfinder'; // Import your Pathfinder utility class
import { City, Connection as TestConnection  } from '../model/City';



const mockMapData = {
  mapname: 'Skyrim',
  connections: [
    { cities: ['Whiterun', 'Windhelm'], distance: 10 },
    { cities: ['Whiterun', 'Riften'], distance: 15 },
    { cities: ['Windhelm', 'Riften'], distance: 20 },
  ],
  cities: [
    { name: 'Whiterun', positionX: 20, positionY: 30 },
    { name: 'Windhelm', positionX: 40, positionY: 50 },
    { name: 'Riften', positionX: 60, positionY: 70 }
  ],
  mapsizeX: 100,
  mapsizeY: 100,
};

// Set up Express app and mount API router
const app = express();
app.use(express.json());
app.use(router);

// Mock the MapDataModel.findOne function
jest.mock('../model/MapDataModel', () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(), // Mocking the findOneAndUpdate function
}));

// Mock the loadMapDataFromJson function
jest.mock('../util/JsonLoader', () => ({
  __esModule: true,
  default: jest.fn(), // Mocking the default export as a Jest mock function
}));

jest.mock('../util/Pathfinder', () => ({
  findShortestPath: jest.fn(), // Mocking the findShortestPath method
}));



jest.mock('../model/RouteHistoryModel', () => ({
  find: jest.fn(), // Mock the find method on RouteHistoryModel
  prototype: {
    save: jest.fn(), // Mock the save method on the instance
  },
}));


beforeEach(() => {
  jest.clearAllMocks();
});


describe('POST /routehistory', () => {
  it('should return 404 if no route history is found for the user', async () => {
    const userId = 'user123';

    (RouteHistoryModel.find as jest.Mock).mockResolvedValueOnce([]);

    const response = await request(app).get(`/routehistory/${userId}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'No route history found for this user' });
  });

  it('should return route history for a user', async () => {
    const userId = 'user123';
    const mockHistory = [
      {
        userId,
        startCity: 'Whiterun',
        endCity: 'Riften',
        shortestPath: ['Whiterun', 'Windhelm', 'Riften'],
        timestamp: new Date().toISOString(), // Ensure the timestamp is a string
      },
    ];

    (RouteHistoryModel.find as jest.Mock).mockResolvedValueOnce(mockHistory);

    const response = await request(app).get(`/routehistory/${userId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockHistory);
  });

  it('should return 500 if an internal server error occurs', async () => {
    const userId = 'user123';

    (RouteHistoryModel.find as jest.Mock).mockRejectedValueOnce(new Error('Internal Server Error'));

    const response = await request(app).get(`/routehistory/${userId}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal Server Error' });
  });
});


beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /mapdata', () => {
    it('should return map data successfully if found in the database', async () => {
      // Mock the behavior of MapDataModel.findOne to return mock map data
      (MapDataModel.findOne as jest.Mock).mockResolvedValue(mockMapData);
  
      // Send a GET request to the /mapdata endpoint
      const response = await request(app).get('/mapdata');
  
      // Assert that the response status is 200
      expect(response.status).toBe(200);
  
      // Assert that the response body matches the mock map data
      expect(response.body).toEqual(mockMapData);
    });
  
    it('should return 404 if map data is not found in the database', async () => {
      // Mock the behavior of MapDataModel.findOne to return null (no map data found)
      (MapDataModel.findOne as jest.Mock).mockResolvedValue(null);
  
      // Send a GET request to the /mapdata endpoint
      const response = await request(app).get('/mapdata');
  
      // Assert that the response status is 404
      expect(response.status).toBe(404);
  
      // Assert that the response body contains the error message
      expect(response.body).toEqual({ error: 'Map data not found' });
    });
  
    it('should return 500 if an internal server error occurs', async () => {
      // Mock the behavior of MapDataModel.findOne to throw an error
      (MapDataModel.findOne as jest.Mock).mockRejectedValue(new Error('Internal Server Error'));
  
      // Send a GET request to the /mapdata endpoint
      const response = await request(app).get('/mapdata');
  
      // Assert that the response status is 500
      expect(response.status).toBe(500);
  
      // Assert that the response body contains the error message
      expect(response.body).toEqual({ error: 'Internal Server Error' });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

describe('GET /shortestpath', () => {
  it('should return 500 if failed to load map data', async () => {
    // Mock failed map data retrieval
    (loadMapDataFromJson as jest.Mock).mockResolvedValueOnce(null);

    // Send a GET request to the /shortestpath endpoint with query parameters
    const response = await request(app).get('/shortestpath').query({ start: 'Whiterun', end: 'Riften' });

    // Assert that the response status is 500
    expect(response.status).toBe(500);
    // Assert that the response body contains the error message
    expect(response.body).toEqual({ error: 'Failed to load map data' });
  });

  it('should return 404 if start or end city is not found', async () => {
    // Mock successful map data retrieval
    (loadMapDataFromJson as jest.Mock).mockResolvedValueOnce(mockMapData);

    // Send a GET request to the /shortestpath endpoint with non-existent city names
    const response = await request(app).get('/shortestpath').query({ start: 'Solitude', end: 'Falkreath' });

    // Assert that the response status is 404
    expect(response.status).toBe(404);
    // Assert that the response body contains the error message
    expect(response.body).toEqual({ error: 'Start or end city not found' });
  });

  it('should return 404 if no path is found between two cities', async () => {
    // Mock successful map data retrieval
    (loadMapDataFromJson as jest.Mock).mockResolvedValueOnce(mockMapData);
    // Mock Pathfinder to return an empty path
    jest.spyOn(Pathfinder, 'findShortestPath').mockReturnValue([]);

    // Send a GET request to the /shortestpath endpoint with valid city names
    const response = await request(app).get('/shortestpath').query({ start: 'Whiterun', end: 'Riften' });

    // Assert that the response status is 404
    expect(response.status).toBe(404);
    // Assert that the response body contains the error message
    expect(response.body).toEqual({ error: 'No path found between the cities' });
  });

  it('should return the shortest path between two cities', async () => {
    // Mock successful map data retrieval
    (loadMapDataFromJson as jest.Mock).mockResolvedValueOnce(mockMapData);
  
    // Mock the start and end cities
    const startCity: City = { name: 'Whiterun', positionX: 20, positionY: 30 }; // Use appropriate values for positionX and positionY
    const endCity: City = { name: 'Riften', positionX: 60, positionY: 70 }; // Use appropriate values for positionX and positionY
  
    // Mock Pathfinder to return a valid path
    jest.spyOn(Pathfinder, 'findShortestPath').mockReturnValue([startCity, { name: 'Windhelm', positionX: 40, positionY: 50 }, endCity]);
  
    // Send a GET request to the /shortestpath endpoint with valid city names
    const response = await request(app).get('/shortestpath').query({ start: startCity.name, end: endCity.name });
  
    // Assert that the response status is 200
    expect(response.status).toBe(200);
  
    expect(response.body).toEqual({ shortestPath: [startCity, { name: 'Windhelm', positionX: 40, positionY: 50 }, endCity] });
  });  
});

beforeEach(() => {
  jest.clearAllMocks();
});
describe('GET /cities', () => {
    it('should return the list of cities successfully', async () => {
      // Mock the behavior of MapDataModel.findOne to return mock city data
      const mockCities = [
        { name: 'City1', positionX: 100, positionY: 200 },
        { name: 'City2', positionX: 150, positionY: 250 },
      ];
      (MapDataModel.findOne as jest.Mock).mockResolvedValueOnce({ cities: mockCities });
  
      // Send a GET request to the /cities endpoint
      const response = await request(app).get('/cities');
  
      // Assert that the response status is 200
      expect(response.status).toBe(200);
  
      // Assert that the response body matches the mock city data
      expect(response.body).toEqual(mockCities);
    });
  
    it('should return 500 if an internal server error occurs', async () => {
      // Mock the behavior of MapDataModel.findOne to throw an error
      (MapDataModel.findOne as jest.Mock).mockRejectedValueOnce(new Error('Internal Server Error'));
  
      // Send a GET request to the /cities endpoint
      const response = await request(app).get('/cities');
  
      // Assert that the response status is 500
      expect(response.status).toBe(500);
  
      // Assert that the response body contains the error message
      expect(response.body).toEqual({ error: 'Internal Server Error' });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('GET /cities/:name', () => {

    it('should return the city by name successfully', async () => {
      const cityName = 'City1';
      const mockCity = { name: cityName, positionX: 100, positionY: 200 };
      
      // Mock the behavior of MapDataModel.findOne to return mock city data
      (MapDataModel.findOne as jest.Mock).mockResolvedValueOnce({ cities: [mockCity] });
  
      // Send a GET request to the /cities/:name endpoint
      const response = await request(app).get(`/cities/${cityName}`);
  
      // Assert that the response status is 200
      expect(response.status).toBe(200);
  
      // Assert that the response body matches the mock city data
      expect(response.body).toEqual(mockCity);
    });
  
    it('should return 404 if the city is not found', async () => {
      const cityName = 'NonExistentCity';
  
      // Mock the behavior of MapDataModel.findOne to return null (city not found)
      (MapDataModel.findOne as jest.Mock).mockResolvedValueOnce(null);
  
      // Send a GET request to the /cities/:name endpoint
      const response = await request(app).get(`/cities/${cityName}`);
  
      // Assert that the response status is 404
      expect(response.status).toBe(404);
  
      // Assert that the response body contains the error message
      expect(response.body).toEqual({ error: 'City not found' });
    });
  
    it('should return 500 if an internal server error occurs', async () => {
      const cityName = 'City1';
  
      (MapDataModel.findOne as jest.Mock).mockRejectedValue(new Error('Internal Server Error'));
  
      // Send a GET request to the /cities/:name endpoint
      const response = await request(app).get(`/cities/${cityName}`);
  
      // Assert that the response status is 500
      expect(response.status).toBe(500);
  
      // Assert that the response body contains the error message
      expect(response.body).toEqual({ error: 'Internal Server Error' });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

describe('PUT /cities/:name', () => {
  it('should update the city by name successfully', async () => {
    const cityName = 'City1';
    const updatedCityData = { name: 'UpdatedCity', positionX: 300, positionY: 400 };
    const mockUpdatedCity = { name: 'UpdatedCity', positionX: 300, positionY: 400 };
    
    // Mock the behavior of MapDataModel.findOneAndUpdate to return the updated city
    (MapDataModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(mockUpdatedCity);

    // Send a PUT request to the /cities/:name endpoint with updated city data
    const response = await request(app)
      .put(`/cities/${cityName}`)
      .send(updatedCityData);

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body matches the updated city data
    expect(response.body).toEqual(mockUpdatedCity);
  });

  it('should return 404 if the city is not found', async () => {
    const cityName = 'NonExistentCity';
    const updatedCityData = { name: 'UpdatedCity', positionX: 300, positionY: 400 };

    // Mock the behavior of MapDataModel.findOneAndUpdate to return null (city not found)
    (MapDataModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(null);

    // Send a PUT request to the /cities/:name endpoint with updated city data
    const response = await request(app)
      .put(`/cities/${cityName}`)
      .send(updatedCityData);

    // Assert that the response status is 404
    expect(response.status).toBe(404);

    // Assert that the response body contains the error message
    expect(response.body).toEqual({ error: 'City not found' });
  });

  it('should return 500 if an internal server error occurs', async () => {
    const cityName = 'City1';
    const updatedCityData = { name: 'UpdatedCity', positionX: 300, positionY: 400 };

    // Mock the behavior of MapDataModel.findOneAndUpdate to throw an error
    (MapDataModel.findOneAndUpdate as jest.Mock).mockRejectedValueOnce(new Error('Internal Server Error'));

    // Send a PUT request to the /cities/:name endpoint with updated city data
    const response = await request(app)
      .put(`/cities/${cityName}`)
      .send(updatedCityData);

    // Assert that the response status is 500
    expect(response.status).toBe(500);

    // Assert that the response body contains the error message
    expect(response.body).toEqual({ error: 'Internal Server Error' });
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /connections', () => {
  it('should return connection data if found in the database', async () => {
    // Mock the behavior of MapDataModel.findOne to return existing map data
    const mockData = {
      mapname: 'Skyrim',
      connections: [
        { cities: ['Whiterun', 'Windhelm'], distance: 10 },
        { cities: ['Whiterun', 'Riften'], distance: 15 },
        { cities: ['Windhelm', 'Riften'], distance: 20 },
      ]
    };
    (MapDataModel.findOne as jest.Mock).mockResolvedValueOnce(mockData);

    // Send a GET request to the /connections endpoint
    const response = await request(app).get('/connections');

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body matches the mock connection data
    expect(response.body).toEqual(mockData.connections);
  });

  it('should return 404 if map data is not found in the database', async () => {
    // Mock the behavior of MapDataModel.findOne to return null (no map data found)
    (MapDataModel.findOne as jest.Mock).mockResolvedValueOnce(null);

    // Send a GET request to the /connections endpoint
    const response = await request(app).get('/connections');

    // Assert that the response status is 404
    expect(response.status).toBe(404);

    // Assert that the response body contains the error message
    expect(response.body).toEqual({ error: 'Map data not found' });
  });

  it('should return 500 if an internal server error occurs', async () => {
    // Mock the behavior of MapDataModel.findOne to throw an error
    (MapDataModel.findOne as jest.Mock).mockRejectedValueOnce(new Error('Internal Server Error'));

    // Send a GET request to the /connections endpoint
    const response = await request(app).get('/connections');

    // Assert that the response status is 500
    expect(response.status).toBe(500);

    // Assert that the response body contains the error message
    expect(response.body).toEqual({ error: 'Internal Server Error' });
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /connections/:name', () => {
  it('should return connections by city name successfully', async () => {
    const cityName = 'Whiterun';
    const mockData = {
      mapname: 'Skyrim',
      connections: [
        { parent: 'Whiterun', child: 'Windhelm', distance: 10 },
        { parent: 'Whiterun', child: 'Riften', distance: 15 },
        { parent: 'Windhelm', child: 'Riften', distance: 20 },
      ]
    };
    (MapDataModel.findOne as jest.Mock).mockResolvedValueOnce(mockData);

    const response = await request(app).get(`/connections/${cityName}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { parent: 'Whiterun', child: 'Windhelm', distance: 10 },
      { parent: 'Whiterun', child: 'Riften', distance: 15 }
    ]);
  });

  it('should return 404 if map data is not found', async () => {
    const cityName = 'Whiterun';
    (MapDataModel.findOne as jest.Mock).mockResolvedValueOnce(null);

    const response = await request(app).get(`/connections/${cityName}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Map data not found' });
  });

  it('should return 404 if no connections are found for the specified city name', async () => {
    const cityName = 'Solitude';
    const mockData = {
      mapname: 'Skyrim',
      connections: [
        { parent: 'Whiterun', child: 'Windhelm', distance: 10 },
        { parent: 'Whiterun', child: 'Riften', distance: 15 },
        { parent: 'Windhelm', child: 'Riften', distance: 20 },
      ]
    };
    (MapDataModel.findOne as jest.Mock).mockResolvedValueOnce(mockData);

    const response = await request(app).get(`/connections/${cityName}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'No connections found for the specified name' });
  });

  it('should return 500 if an internal server error occurs', async () => {
    const cityName = 'Whiterun';
    (MapDataModel.findOne as jest.Mock).mockRejectedValueOnce(new Error('Internal Server Error'));

    const response = await request(app).get(`/connections/${cityName}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal Server Error' });
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /cities', () => {
  it('should create a new city successfully', async () => {
    const newCityData = {
      name: 'NewCity',
      positionX: 100,
      positionY: 200
    };

    const updatedMapData = {
      mapname: 'Skyrim',
      cities: [
        { name: 'City1', positionX: 50, positionY: 50 },
        { name: 'City2', positionX: 80, positionY: 80 },
        // Include existing cities data here
      ]
    };

    (MapDataModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(updatedMapData);

    const response = await request(app)
      .post('/cities')
      .send(newCityData);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(updatedMapData);
  });

  it('should return 400 if missing data for new city', async () => {
    const invalidCityData = {
      positionX: 100,
      positionY: 200
    };

    const response = await request(app)
      .post('/cities')
      .send(invalidCityData);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing data for new city. Name, positionX, and positionY are required.' });
  });

  it('should return 404 if map data is not found and could not be created', async () => {
    const newCityData = {
      name: 'NewCity',
      positionX: 100,
      positionY: 200
    };

    (MapDataModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/cities')
      .send(newCityData);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Map data not found and could not be created' });
  });

  it('should return 500 if an internal server error occurs', async () => {
    const newCityData = {
      name: 'NewCity',
      positionX: 100,
      positionY: 200
    };

    (MapDataModel.findOneAndUpdate as jest.Mock).mockRejectedValueOnce(new Error('Internal Server Error'));

    const response = await request(app)
      .post('/cities')
      .send(newCityData);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal Server Error' });
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /connections', () => {
  it('should create a new connection successfully', async () => {
    const newConnectionData = {
      parent: 'City1',
      child: 'City2'
    };

    const updatedMapData = {
      mapname: 'Skyrim',
      connections: [
        { parent: 'City1', child: 'City2' },
        // Include existing connections data here
      ]
    };

    (MapDataModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(updatedMapData);

    const response = await request(app)
      .post('/connections')
      .send(newConnectionData);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(updatedMapData);
  });

  it('should return 400 if both parent and child cities are not provided', async () => {
    const invalidConnectionData = {};

    const response = await request(app)
      .post('/connections')
      .send(invalidConnectionData);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Both parent and child cities must be provided.' });
  });

  it('should return 404 if map data is not found and could not be created', async () => {
    const newConnectionData = {
      parent: 'City1',
      child: 'City2'
    };

    (MapDataModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/connections')
      .send(newConnectionData);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Map data not found and could not be created.' });
  });

  it('should return 500 if an internal server error occurs', async () => {
    const newConnectionData = {
      parent: 'City1',
      child: 'City2'
    };

    (MapDataModel.findOneAndUpdate as jest.Mock).mockRejectedValueOnce(new Error('Internal Server Error'));

    const response = await request(app)
      .post('/connections')
      .send(newConnectionData);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal Server Error' });
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DELETE /cities/:name', () => {
  it('should delete a city by name successfully', async () => {
    const cityName = 'City1';

    // Define the type for cities explicitly
    interface MapData {
      mapname: string;
      cities: { name: string, positionX: number, positionY: number }[];
    }

    const mapDataAfterDeletion: MapData = {
      mapname: 'Skyrim',
      cities: [
        // Include remaining cities after deletion, if any
      ]
    };

    (MapDataModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(mapDataAfterDeletion);

    const response = await request(app)
      .delete(`/cities/${cityName}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: `City '${cityName}' deleted successfully`,
      mapData: mapDataAfterDeletion
    });
  });

  it('should return 404 if map data is not found', async () => {
    const cityName = 'City1';

    (MapDataModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(null);

    const response = await request(app)
      .delete(`/cities/${cityName}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Map data not found' });
  });

  it('should return 500 if an internal server error occurs', async () => {
    const cityName = 'City1';

    (MapDataModel.findOneAndUpdate as jest.Mock).mockRejectedValueOnce(new Error('Internal Server Error'));

    const response = await request(app)
      .delete(`/cities/${cityName}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal Server Error' });
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DELETE /connections', () => {
  it('should delete a connection successfully', async () => {
    const parent = 'ParentCity';
    const child = 'ChildCity';
    
    // Mock the behavior of MapDataModel.findOneAndUpdate to return updated map data
    const updatedMapData: { mapname: string; connections: TestConnection[] } = {
      mapname: 'Skyrim',
      connections: [
        // Remaining connections after deletion, if any
      ]
    };
    (MapDataModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(updatedMapData);

    const response = await request(app)
      .delete('/connections')
      .send({ parent, child });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: `Connection from '${parent}' to '${child}' deleted successfully`,
      mapData: updatedMapData
    });
  });

  it('should return 404 if connection or map data not found', async () => {
    const parent = 'NonExistentParent';
    const child = 'NonExistentChild';

    // Mock the behavior of MapDataModel.findOneAndUpdate to return null (connection not found)
    (MapDataModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(null);

    const response = await request(app)
      .delete('/connections')
      .send({ parent, child });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Connection not found or Map data not found' });
  });

  it('should return 400 if parent or child not provided', async () => {
    const response = await request(app)
      .delete('/connections')
      .send({ parent: 'ParentCity' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Both parent and child cities must be provided.' });
  });

  it('should return 500 if an internal server error occurs', async () => {
    const parent = 'ParentCity';
    const child = 'ChildCity';

    // Mock the behavior of MapDataModel.findOneAndUpdate to throw an error
    (MapDataModel.findOneAndUpdate as jest.Mock).mockRejectedValueOnce(new Error('Internal Server Error'));

    const response = await request(app)
      .delete('/connections')
      .send({ parent, child });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal Server Error' });
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PUT /connections', () => {
  it('should update a connection successfully', async () => {
    const oldParent = 'OldParent';
    const oldChild = 'OldChild';
    const newParent = 'NewParent';
    const newChild = 'NewChild';

    // Mock the behavior of MapDataModel.findOneAndUpdate to return updated map data
    const updatedMapData = {
      mapname: 'Skyrim',
      connections: [
        { parent: newParent, child: newChild },
        // Include remaining connections after update, if any
      ]
    };
    (MapDataModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(updatedMapData);

    const response = await request(app)
      .put('/connections')
      .send({ oldParent, oldChild, newParent, newChild });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: `Connection updated successfully from '${oldParent}-${oldChild}' to '${newParent}-${newChild}'`,
      updatedMapData
    });
  });

  it('should return 404 if connection to update is not found', async () => {
    const oldParent = 'NonExistentParent';
    const oldChild = 'NonExistentChild';
    const newParent = 'NewParent';
    const newChild = 'NewChild';

    // Mock the behavior of MapDataModel.findOneAndUpdate to return null (connection not found)
    (MapDataModel.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(null);

    const response = await request(app)
      .put('/connections')
      .send({ oldParent, oldChild, newParent, newChild });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Connection not found or update failed' });
  });

  it('should return 400 if old and new parent/child not provided', async () => {
    const response = await request(app)
      .put('/connections')
      .send({ oldParent: 'OldParent', oldChild: 'OldChild', newParent: 'NewParent' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Both old and new parent and child cities must be provided.' });
  });

  it('should return 500 if an internal server error occurs', async () => {
    const oldParent = 'OldParent';
    const oldChild = 'OldChild';
    const newParent = 'NewParent';
    const newChild = 'NewChild';

    // Mock the behavior of MapDataModel.findOneAndUpdate to throw an error
    (MapDataModel.findOneAndUpdate as jest.Mock).mockRejectedValueOnce(new Error('Internal Server Error'));

    const response = await request(app)
      .put('/connections')
      .send({ oldParent, oldChild, newParent, newChild });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal Server Error' });
  });
});