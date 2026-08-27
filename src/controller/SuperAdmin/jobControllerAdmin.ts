import type { NextFunction, Request, Response } from "express";
import JobPosting from "../../model/ExpertjobPostingSchema";
import redisClient from "../../helper/redisServer";


export const getJobs = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 15, 1),
      100
    );

    const skip = (page - 1) * limit;

 const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

const category = req.query.category || ""

  
    const filter: Record<string, any> = {};




    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if(category){
        filter.category=category
    }

const [jobs, totalJobs] = await Promise.all([
      JobPosting.find(filter)
        .select("expertId title jobType  category applicationsCount ").populate("expertId","fullname ")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      JobPosting.countDocuments(filter),
    ]);


      return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",

      jobs,

      pagination: {
        totalJobs,
        totalPages: Math.ceil(totalJobs / limit),
        currentPage: page,
        limit,
      },
    });


    } catch (error) {
      next(error)  
    }
}

export const getSingleJob= async(req:Request,res:Response,next:NextFunction)=>{
    try {
      const jobId =  req.params.id;  
      const job = await JobPosting.findById(jobId).populate("expertId","fullname email phone image about")
        if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    
  return res.status(200).json({
      success: true,
      message: "Job fetched successfully",
      job,
    });



    } catch (error) {
        next(error)
    }
}


export const setHomeJob= async(req:Request,res:Response,next:NextFunction)=>{
    try {
    const jobId =  req.params.id;
      
    const job = await JobPosting.findById(jobId);
              if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });}
  if(job.rejected){return res.status(404).json({success:false,message:"Job Status rejected"})}
   
   job.homepage= !job.homepage

    await job.save()
     const key=`devan-jobs`
     const jobshome = await JobPosting.find({homepage: true,rejected:false,status:"PUBLISHED"}).select("description  title slug jobType   category expertId").populate("expertId","fullname designation")

  await redisClient.set(
      key,
      JSON.stringify(jobshome),
      {
        EX: 300,
      }
    );
return res.status(200).json({success:true,message:"Job updated"})

    } catch (error) {
        next(error)
    }
}



export const rejectJob=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const jobId =  req.params.id;
          const {reason} = req.body

          const job = await JobPosting.findById(jobId);
              if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });}
      if(job.rejected){
job.rejectionReason=null;
 job.rejected= false;
      }else{
job.rejectionReason=reason;
 job.rejected= true;
 job.homepage = false;
      }
 
 await job.save();
 return res.status(200).json({success:true,message:"Job Status Cancelled"})



    } catch (error) {
        next(error)
    }
}
