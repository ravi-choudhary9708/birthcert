import mongoose, { Schema, Document, Model } from 'mongoose';

export type AppStatus = 'pending' | 'verifier_approved' | 'operator_approved' | 'rejected';

export interface IApplication extends Document {
  applicationNumber: string;

  // Child info
  dateOfBirth: Date;
  sex: 'male' | 'female' | 'transgender';
  childName?: string;

  // Father
  fatherName: string;
  fatherMobile: string;
  fatherEmail: string;
  fatherAadhaar?: string;
  fatherReligion: string;
  fatherEducation: string;
  fatherOccupation: string;

  // Mother
  motherName: string;
  motherMobile: string;
  motherEmail: string;
  motherAadhaar?: string;
  motherReligion: string;
  motherEducation: string;
  motherOccupation: string;
  motherAgeAtDelivery: number;

  // Contact email for notifications (one of the parents' emails)
  contactEmail: string;

  // Address
  addressAtBirth: string;
  permanentAddress: string;
  village: string;
  subDistrict: string;
  district: string;
  state: string;
  pinCode: string;

  // Place of birth
  placeOfBirth: 'hospital' | 'home' | 'other';
  institutionName?: string;
  institutionAddress?: string;

  // Informant
  informantName: string;
  informantMobile: string;

  // Medical
  birthWeight?: number;
  gestationPeriod?: number;
  deliveryMethod: 'normal' | 'caesarean' | 'forceps' | 'other';

  // Workflow
  status: AppStatus;
  rejectionReason?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    applicationNumber: { type: String, required: true, unique: true },

    dateOfBirth: { type: Date, required: true },
    sex: { type: String, enum: ['male', 'female', 'transgender'], required: true },
    childName: { type: String, trim: true },

    fatherName: { type: String, required: true, trim: true },
    fatherMobile: { type: String, required: true },
    fatherEmail: { type: String, required: true, lowercase: true },
    fatherAadhaar: { type: String },
    fatherReligion: { type: String, required: true },
    fatherEducation: { type: String, required: true },
    fatherOccupation: { type: String, required: true },

    motherName: { type: String, required: true, trim: true },
    motherMobile: { type: String, required: true },
    motherEmail: { type: String, required: true, lowercase: true },
    motherAadhaar: { type: String },
    motherReligion: { type: String, required: true },
    motherEducation: { type: String, required: true },
    motherOccupation: { type: String, required: true },
    motherAgeAtDelivery: { type: Number, required: true },

    contactEmail: { type: String, required: true, lowercase: true },

    addressAtBirth: { type: String, required: true },
    permanentAddress: { type: String, required: true },
    village: { type: String, required: true },
    subDistrict: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },

    placeOfBirth: { type: String, enum: ['hospital', 'home', 'other'], required: true },
    institutionName: { type: String },
    institutionAddress: { type: String },

    informantName: { type: String, required: true },
    informantMobile: { type: String, required: true },

    birthWeight: { type: Number },
    gestationPeriod: { type: Number },
    deliveryMethod: { type: String, enum: ['normal', 'caesarean', 'forceps', 'other'], required: true },

    status: { type: String, enum: ['pending', 'verifier_approved', 'operator_approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

const Application: Model<IApplication> =
  mongoose.models.Application ?? mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
