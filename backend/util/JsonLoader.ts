// Import the JSON file using ES module syntax
import { MapData } from "../model/City";
import MapDataModel, { IMapData } from '../model/MapDataModel'; // Import your Mongoose model

async function loadMapDataFromJson(): Promise<MapData | null> {
    try {
        // Query the database to retrieve map data
        const mapDataFromDB: IMapData | null = await MapDataModel.findOne({ mapname: 'Skyrim' });

        if (!mapDataFromDB) {
            console.error('Map data not found in the database');
            return null;
        }

        // Convert the database document to MapData object
        const mapData: MapData = new MapData(
            mapDataFromDB.mapname,
            mapDataFromDB.connections,
            mapDataFromDB.cities,
            mapDataFromDB.mapsizeX,
            mapDataFromDB.mapsizeY
        );

        return mapData;
    } catch (error) {
        console.error('Error loading map data from the database:', error);
        return null;
    }
}

export default loadMapDataFromJson;
