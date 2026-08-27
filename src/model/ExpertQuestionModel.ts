import mongoose, { Document, Schema, Types } from "mongoose";

interface IChallengeFile {
  url: string;
  name: string;
  type?: string;
} 

export interface IWeeklyChallenge extends Document {
  expertId: Types.ObjectId;

  question: string;
referenceImages:String | null;

  startDate: Date | null;
  submissionDeadline: Date | null;
  resultDate?: Date | null;

  status:
    | "DRAFT"
    | "UPCOMING"
    | "ACTIVE"
    | "SUBMISSION_CLOSED"
    | "RESULT_ANNOUNCED"
    | "COMPLETED";

  correctAnswer?: string;
  expertExplanation?: string;

  bestAnswerId?: Types.ObjectId;
  championUserId?: Types.ObjectId;

  resultAnnouncedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}


const WeeklyChallengeSchema = new Schema<IWeeklyChallenge>(
  {
    expertId: {
      type: Schema.Types.ObjectId,
      ref: "Expert",
      required: true,
      index: true,
    },


    question: {
      type: String,
      required: true,
      trim: true,
    },

    referenceImages: {
      type: String,
      default:null,
    },

 

    startDate: {
      type: Date,
      default:null,
    },

    submissionDeadline: {
      type: Date,
      default:null,
    },
 
    resultDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "ACTIVE",
        "SUBMISSION_CLOSED",
        "RESULT_ANNOUNCED",
        "COMPLETED",
      ],
      default: "DRAFT",
      index: true,
    },

    correctAnswer: {
      type: String,
      default: "",
    },

    expertExplanation: {
      type: String,
      default: "",
    },
 
    bestAnswerId: {
      type: Schema.Types.ObjectId,
      ref: "ChallengeAnswer",
      default: null,
    },

    championUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resultAnnouncedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IWeeklyChallenge>(
  "WeeklyChallenge",
  WeeklyChallengeSchema
);