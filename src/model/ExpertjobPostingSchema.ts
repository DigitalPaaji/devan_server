import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

interface IAppliedUser {
  user: Types.ObjectId;
  resume: string | null; 
}

export interface IJobPosting extends Document {
  expertId: Types.ObjectId;

  title: string;
  slug?: string;

  category:
    | "CSSD Technician"
    | "CSSD Supervisor"
    | "CSSD Manager"
    | "Infection Control Professional";

  description: string;

  responsibilities: string[];
  qualifications: string[];
  skills: string[];

  experience: {
    min: number;
    max?: number;
  };

  jobType:
    | "FULL_TIME"
    | "PART_TIME"
    | "CONTRACT"
    | "INTERNSHIP";

  workMode:
    | "ONSITE"
    | "REMOTE"
    | "HYBRID";

  location: {
    city?: string;
    state?: string;
    country: string;
  };

  salary: {
    min?: number;
    max?: number;
    currency: string;
    period: "YEARLY" | "MONTHLY";
    isNegotiable: boolean;
  };

  openings: number;

  applicationDeadline?: Date;

  status:
    | "DRAFT"
    | "PUBLISHED"
    | "CLOSED"
    | "EXPIRED";

  isFeatured: boolean;

  views: number;

  applicationsCount: number;

  applydUser: IAppliedUser[];
  rejected:Boolean;
  homepage:Boolean;
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const appliedUserSchema = new Schema<IAppliedUser>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resume: {
      type: String,
      default: null,
    },
  },
  {
    _id: true,
  }
);

const jobPostingSchema = new Schema<IJobPosting>(
  {
    expertId: {
      type: Schema.Types.ObjectId,
      ref: "Expert",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "CSSD Technician",
        "CSSD Supervisor",
        "CSSD Manager",
        "Infection Control Professional",
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    responsibilities: [
      {
        type: String,
        trim: true,
      },
    ],

    qualifications: [
      {
        type: String,
        trim: true,
      },
    ],

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    experience: {
      min: {
        type: Number,
        default: 0,
      },

      max: {
        type: Number,
      },
    },

    jobType: {
      type: String,
      enum: [
        "FULL_TIME",
        "PART_TIME",
        "CONTRACT",
        "INTERNSHIP",
      ],
      default: "FULL_TIME",
    },

    workMode: {
      type: String,
      enum: ["ONSITE", "REMOTE", "HYBRID"],
      default: "ONSITE",
    },

    location: {
      city: {
        type: String,
        trim: true,
      },

      state: {
        type: String,
        trim: true,
      },

      country: {
        type: String,
        default: "India",
      },
    },

    salary: {
      min: {
        type: Number,
      },

      max: {
        type: Number,
      },

      currency: {
        type: String,
        default: "INR",
      },

      period: {
        type: String,
        enum: ["YEARLY", "MONTHLY"],
        default: "YEARLY",
      },

      isNegotiable: {
        type: Boolean,
        default: false,
      },
    },

    openings: {
      type: Number,
      default: 1,
      min: 1,
    },

    applicationDeadline: {
      type: Date,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PUBLISHED",
        "CLOSED",
        "EXPIRED",
      ],
      default: "DRAFT",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
    },

    applicationsCount: {
      type: Number,
      default: 0,
    },

    applydUser: {
      type: [appliedUserSchema],
      default: [],
    },
    homepage:{
    type:Boolean,
    default:false
    },
rejected:{
      type:Boolean,
      default:false
    },
  rejectionReason:{
 type: String,
      trim: true,
      default: null,
    },

  },
  
  {
    timestamps: true,
  }
);

const JobPosting: Model<IJobPosting> =
  mongoose.models.JobPosting ||
  mongoose.model<IJobPosting>(
    "JobPosting",
    jobPostingSchema
  );

export default JobPosting;