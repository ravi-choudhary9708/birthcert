import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHospital extends Document {
  hospitalNo: number;        // 1-40
  name: string;
  district: string;
  contactNo: string;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSchema = new Schema<IHospital>(
  {
    hospitalNo: { type: Number, required: true, unique: true, min: 1, max: 39 },
    name: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    contactNo: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Hospital: Model<IHospital> =
  mongoose.models.Hospital ?? mongoose.model<IHospital>('Hospital', HospitalSchema);

export default Hospital;