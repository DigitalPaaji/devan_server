import { Schema, Types, model, Document } from "mongoose";

export type ChampionType = "WEEK" | "MONTH" | "YEAR";

export interface IChampion extends Document {
  userId: Types.ObjectId;
  type: ChampionType;

  challengeId?: Types.ObjectId | null;
  answerId?: Types.ObjectId | null;

  title?: string | null;
  description?: string | null;
  image?: string | null;

  periodStart: Date;
  periodEnd: Date;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const championSchema = new Schema<IChampion>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["WEEK", "MONTH", "YEAR"],
      required: true,
    },

    challengeId: {
      type: Schema.Types.ObjectId,
      ref: "WeeklyChallenge",
      default: null,
    },

    answerId: {
      type: Schema.Types.ObjectId,
      ref: "ChallengeAnswer",
      default: null,
    },

    title: {
      type: String,
      trim: true,
      default: null,
    },

    description: {
      type: String,
      trim: true,
      default: null,
    },

    image: {
      type: String,
      default: null,
    },

    periodStart: {
      type: Date,
      required: true,
    },

    periodEnd: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

championSchema.index({
  type: 1,
  periodStart: 1,
  periodEnd: 1,
});

export const Champion = model<IChampion>(
  "Champion",
  championSchema
);