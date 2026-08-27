import { Schema, model, Document } from "mongoose";

export interface IExpert extends Document {
  fullname: string;
  email: string;
  password: string;
  phone?: string | null;
  image?: string | null;
  designation?: string | null;
  qualification?: string | null;
  specialization?: string | null;
  expertise: string[];
  experienceYears?: number | null;
  organization?: string | null;
  registrationNo?: string | null;
  department?: string | null;
  about?: string | null;
  gender: "male" | "female" | "other";
  address?: string | null;
  city?: string | null;
  state?: string | null;
  linkedinUrl?: string | null;
  status: boolean;
  lastLoginAt?: Date | null;
  dateOfBirth?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ExpertSchema = new Schema<IExpert>(
  {
    fullname: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    phone: {
      type: String,
      default: null,
      trim: true,
    },

    image: {
      type: String,
      default: null,
      trim: true,
    },

    designation: {
      type: String,
      default: null,
      trim: true,
    },

    qualification: {
      type: String,
      default: null,
      trim: true,
    },

    specialization: {
      type: String,
      default: null,
      trim: true,
    },

    expertise: {
      type: [String],
      default: [],
    },

    experienceYears: {
      type: Number,
      default: null,
      min: [0, "Experience cannot be negative"],
    },

    organization: {
      type: String,
      default: null,
      trim: true,
    },

    registrationNo: {
      type: String,
      default: null,
      trim: true,
    },

    department: {
      type: String,
      default: null,
      trim: true,
    },

    about: {
      type: String,
      default: null,
      trim: true,
    },

    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: "Gender must be male, female, or other",
      },
      default: "male",
    },

    address: {
      type: String,
      default: null,
      trim: true,
    },

    city: {
      type: String,
      default: null,
      trim: true,
    },

    state: {
      type: String,
      default: null,
      trim: true,
    },

    linkedinUrl: {
      type: String,
      default: null,
      trim: true,
    },

    status: {
      type: Boolean,
      default: true,
      index: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Expert = model<IExpert>("Expert", ExpertSchema);

export default Expert;