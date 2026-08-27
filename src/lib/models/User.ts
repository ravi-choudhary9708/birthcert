import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'hospital_staff' | 'operator' | 'admin';
  hospitalId?: mongoose.Types.ObjectId;  // required if role === 'hospital_staff', null otherwise
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['hospital_staff', 'operator', 'admin'], required: true },
    hospitalId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Hospital',
      required: function(this: IUser) { return this.role === 'hospital_staff'; },
      default: null
    },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema);

export default User;
