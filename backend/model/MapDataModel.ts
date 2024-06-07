// MapDataModel.ts
import mongoose from 'mongoose';
const { Schema } = mongoose;

export interface IConnection extends Document {
  parent: string;
  child: string;
}

export interface ICity extends Document {
  name: string;
  positionX: number;
  positionY: number;
}

export interface IMapData extends Document {
  mapname: string;
  connections: IConnection[];
  cities: ICity[];
  mapsizeX: number;
  mapsizeY: number;
}

const connectionSchema = new Schema<IConnection>({
  parent: String,
  child: String
});

const citySchema = new Schema<ICity>({
  name: String,
  positionX: Number,
  positionY: Number
});

const mapDataSchema = new Schema<IMapData>({
  mapname: String,
  connections: [connectionSchema],
  cities: [citySchema],
  mapsizeX: Number,
  mapsizeY: Number
});

const MapDataModel = mongoose.model<IMapData>('MapData', mapDataSchema);

export default MapDataModel;
