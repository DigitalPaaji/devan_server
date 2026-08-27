import mongoose, {
  Document,
  Schema,
  Types,
} from "mongoose";



export interface IChallengeAnswer extends Document {
  challengeId: Types.ObjectId;
  userId: Types.ObjectId;

  answer: string;
 



  isBestAnswer: boolean;

 
}


const ChallengeAnswerSchema =
  new Schema<IChallengeAnswer>(
    {
      challengeId: {
        type: Schema.Types.ObjectId,
        ref: "WeeklyChallenge",
        required: true,
        index: true,
      },

      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      answer: {
        type: String,
        required: true,
        trim: true,
      },

    

   
      isBestAnswer: {
        type: Boolean,
        default: false,
      },

     
    },
    {
      timestamps: true,
    }
  );

// One answer per user per challenge
ChallengeAnswerSchema.index(
  {
    challengeId: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model<IChallengeAnswer>(
  "ChallengeAnswer",
  ChallengeAnswerSchema
);