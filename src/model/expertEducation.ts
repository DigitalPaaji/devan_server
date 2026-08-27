import { Schema, model, Document } from "mongoose";

export interface IExpertEducation extends Document {
  expertId: Schema.Types.ObjectId;
  category:
    | "Sterilization Basics"
    | "Steam Sterilization"
    | "ETO Sterilization"
    | "Plasma Sterilization"
    | "CSSD Management"
    | "Infection Control"
    | "Standards & Guidelines"
    | "Case Studies";
  status: "DRAFT" | "REJECTED" | "PUBLISHED";
  rejectionReason?: string | null;
  homepage:Boolean;
  ytlink: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpertEducationSchema = new Schema<IExpertEducation>(
  {
    expertId: {
      type: Schema.Types.ObjectId,
      ref: "Expert",
      required: [true, "Expert ID is required"],
      index: true,
    },

    category: {
      type: String,
      enum: {
        values: [
          "Sterilization Basics",
          "Steam Sterilization",
          "ETO Sterilization",
          "Plasma Sterilization",
          "CSSD Management",
          "Infection Control",
          "Standards & Guidelines",
          "Case Studies",
        ],
        message: "Invalid education category",
      },
      required: [true, "Category is required"],
      trim: true,
      index: true,
    },

    ytlink: {
      type: String,
      required: [true, "YouTube link is required"],
      trim: true,
    },

 status: {
      type: String,
      enum: {
        values: ["DRAFT", "REJECTED", "PUBLISHED"],
        message: "Invalid article status",
      },
      default: "PUBLISHED",
      index: true,
    },
homepage:{
  type:Boolean,
  default:false
},
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },

  },
  {
    timestamps: true,
  }
);

export const ExpertEducation = model<IExpertEducation>(
  "ExpertEducation",
  ExpertEducationSchema
);