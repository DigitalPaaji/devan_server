import type { NextFunction, Request, Response } from "express";
import JobPosting from "../../model/ExpertjobPostingSchema";

interface IAuth extends Request{
    expert :any
}

 const allowedCategories = [
      "CSSD Technician",
      "CSSD Supervisor",
      "CSSD Manager",
      "Infection Control Professional",
    ];


export const CreateJob = async(req:IAuth,res:Response,next:NextFunction)=>{
try {
    const expertId = req.expert?._id;
const {title ,category ,description ,responsibilities,qualifications,skills,experience,jobType,workMode,location,salary,openings,applicationDeadline,status} = req.body
    if(!title || !category || !description  ){

   return res.status(400).json({
        success: false,
        message: "Title, category and description are required",
      });

    }
   if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job category",
      });
    }
  const slug = `${title
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")}-${Date.now()}`;

 const job = await JobPosting.create({
      expertId,

      title: title.trim(),

      slug,

      category,

      description,

      responsibilities: Array.isArray(responsibilities)
        ? responsibilities
        : [],

      qualifications: Array.isArray(qualifications)
        ? qualifications
        : [],

      skills: Array.isArray(skills)
        ? skills
        : [],

      experience: {
        min: experience?.min ?? 0,
        max: experience?.max ?? undefined,
      },

      jobType: jobType || "FULL_TIME",

      workMode: workMode || "ONSITE",

      location: {
        city: location?.city || "",
        state: location?.state || "",
        country: location?.country || "India",
      },

      salary: {
        min: salary?.min ?? undefined,
        max: salary?.max ?? undefined,
        currency: salary?.currency || "INR",
        period: salary?.period || "YEARLY",
        isNegotiable: salary?.isNegotiable ?? false,
      },

      openings: openings || 1,

      applicationDeadline: applicationDeadline
        ? new Date(applicationDeadline)
        : undefined,

      status: status || "DRAFT",


      views: 0,

      applicationsCount: 0,

      applydUser: [],
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
} catch (error) {
    next(error)
}

}


export const getAllJob = async(req:IAuth,res:Response,next:NextFunction)=>{
try {

  const expertId = req.expert?._id;
 const jobs = await JobPosting.find({expertId}).select("title  category status views applicationsCount")

return res.status(200).json({
  success:true,
  jobs
})
  
} catch (error) {
  next(error)
}


}

export const getJob= async(req:IAuth,res:Response,next:NextFunction)=>{
  try {
const {type="view"} = req.query
const {jobId}= req.params;
 const expertId = req.expert?._id;

  if (!expertId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    let job;


 if(type=="view"){
     job = await JobPosting.findOne({_id:jobId,expertId}).populate("applydUser.user")
 }
 else if(type=="edit"){
     job = await JobPosting.findOne({_id:jobId,expertId})

 } else {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Use view or edit",
      });
    }


    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

     return res.status(200).json({
      success: true,
      message: "Job fetched successfully",
      data: job,
    });
  } catch (error) {
    next(error)
  }
}




export const UpdateJob = async(req:IAuth,res:Response,next:NextFunction)=>{
try {
    const expertId = req.expert?._id;
    const {jobId}= req.params;

      if (!expertId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

 const jobPosting = await JobPosting.findOne({_id:jobId,expertId})
  if (!jobPosting) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }


const {title ,category ,description ,responsibilities,qualifications,skills,experience,jobType,workMode,location,salary,openings,applicationDeadline,status} = req.body
    if(!title || !category || !description  ){

   return res.status(400).json({
        success: false,
        message: "Title, category and description are required",
      });

    }
   if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job category",
      });
    }
 

    jobPosting.title = title.trim();
    jobPosting.category = category;
    jobPosting.description = description;
    jobPosting.responsibilities = Array.isArray(responsibilities)
      ? responsibilities
      : [];
    jobPosting.qualifications = Array.isArray(qualifications)
      ? qualifications
      : [];

    jobPosting.skills = Array.isArray(skills)
      ? skills
      : [];  
       jobPosting.experience = {
      min: experience?.min ?? 0,
      max: experience?.max ?? undefined,
    };
    jobPosting.jobType = jobType || "FULL_TIME";
    jobPosting.workMode = workMode || "ONSITE";

    jobPosting.location = {
      city: location?.city || "",
      state: location?.state || "",
      country: location?.country || "India",
    };

jobPosting.salary = {
      min: salary?.min ?? undefined,
      max: salary?.max ?? undefined,
      currency: salary?.currency || "INR",
      period: salary?.period || "YEARLY",
      isNegotiable: salary?.isNegotiable ?? false,
    };
 jobPosting.openings = Number(openings) || 1;

 if (applicationDeadline) {
      const deadline = new Date(applicationDeadline);

      if (isNaN(deadline.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid application deadline",
        });
      }

      jobPosting.applicationDeadline = deadline;
    } else {
      jobPosting.applicationDeadline = undefined;
    }
if (status) {
      const allowedStatus = [
        "DRAFT",
        "PUBLISHED",
        "CLOSED",
        "REJECTED",
      ];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid job status",
        });
      }

      jobPosting.status = status;
    }
 await jobPosting.save();

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: jobPosting,
    });
} catch (error) {
    next(error)
}

}

export const DeleteJob = async(req:IAuth,res:Response,next:NextFunction)=>{
  try {
 const expertId = req.expert?._id;
    const {jobId}= req.params;
      if (!expertId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

await  JobPosting.deleteOne({_id:jobId,expertId});

return res.status(200).json({
  success:"true",
  message:"Job posting deleted"
})

  } catch (error) {
    next(error)
  }
}

export const GetApplyedjob = async(req:IAuth,res:Response,next:NextFunction)=>{
  try {
const expertId = req.expert._id;
const jobId = req.params.jobId;


const jobPosted = await JobPosting.findOne({_id:jobId,expertId}).select("applydUser").populate("applydUser.user","fullname email phone image gender address")
    
if(!jobPosted){
  return res.status(404).json({success:false,message:"Job not found"})
}


return res.status(200).json({
  success:true,
  jobs:jobPosted
})


  } catch (error) {
    next(error)
  }
}
