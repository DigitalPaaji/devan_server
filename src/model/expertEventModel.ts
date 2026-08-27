import mongoose, { Document, Model, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  slug: string;
  image?: string;
  description: string;
  venue: string;
  date: Date;
  expertId:mongoose.Types.ObjectId,
  organizer: {
    name: string;
    email?: string;
    phone?: string;
  };
  homepage:Boolean;
rejectionReason?: string | null;
  status: "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {

    expertId:{
      type: Schema.Types.ObjectId,
      ref: "Expert",
    },
    title: {
      type: String,
      required: true,
      trim: true, 
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    image: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
    homepage:{
type:Boolean,
default:false
    },

    venue: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    organizer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
      },

      phone: {
        type: String,
        trim: true,
      },
    },

 
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED","COMPLETED","CANCELLED"],
      default: "DRAFT",
      index: true,
    },
    rejectionReason:{
 type: String,
      trim: true,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

export const Event: Model<IEvent> =
  mongoose.models.Event ||
  mongoose.model<IEvent>("Event", EventSchema);