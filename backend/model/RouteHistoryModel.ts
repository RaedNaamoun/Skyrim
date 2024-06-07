// model/RouteHistoryModel.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IRouteHistory extends Document {
  userId: string;
  startCity: string;
  endCity: string;
  shortestPath: string[];
  timestamp: Date;
}

const RouteHistorySchema: Schema = new Schema({
  userId: { type: String, required: true },
  startCity: { type: String, required: true },
  endCity: { type: String, required: true },
  shortestPath: { type: [String], required: true },
  timestamp: { type: Date, default: Date.now }
});

const RouteHistoryModel = mongoose.model<IRouteHistory>('RouteHistory', RouteHistorySchema);

export default RouteHistoryModel;
