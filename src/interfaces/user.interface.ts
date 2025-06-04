import { Document } from 'mongoose';

export interface User extends Document {
  email: string;
  trips: string[];
  createdAt: Date;
}