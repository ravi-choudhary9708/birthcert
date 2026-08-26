import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'verifier' | 'operator';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['verifier', 'operator'], required: true },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema);

export default User;
