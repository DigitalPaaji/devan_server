
import  type { NextFunction, Request, Response } from "express";
import redisClient from "../../helper/redisServer";
import JobPosting from "../../model/ExpertjobPostingSchema";
import User from "../../model/userModel";


export const getHomepageJobs = async(req:Request,res:Response,next:NextFunction)=>{
    try {
         const key=`devan-jobs`
    const cacheJobs = await redisClient.get(key) 
    if(cacheJobs){
        return res.status(200).json({
            success:true,
            jobs:JSON.parse(cacheJobs)
        })
    }
    
    const jobs = await JobPosting.find({homepage: true,rejected:false,status:"PUBLISHED"}).select("description  title slug jobType   category expertId").populate("expertId","fullname designation")


     await redisClient.set(
      key,
      JSON.stringify(jobs),
      {
        EX: 300,
      }
    );
 return res.status(200).json({
      success: true,
      jobs,
    });
    } catch (error) {
      next(error)  
    }
}


export const getJobs = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const page = Number(req.query.page) || 1
        const limit= Number(req.query.limit) || 20;
        const skip = limit * (page - 1);
        const search = typeof req.query.search === "string" ? req.query.search.trim(): "";
        const jobType = typeof req.query.jobtype === "string" ? req.query.jobtype.trim(): "";
        const workMode = typeof req.query.workmode === "string" ? req.query.workmode.trim(): "";


        const filter:any  ={
           rejected:false ,
           status:"PUBLISHED"
        }

        if(search){
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
        {
          slug: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
        }
         if(jobType){
            filter.jobType=jobType
         }
         if(workMode){
            filter.workMode=workMode
         }


           const [jobs,totalJobs] = await Promise.all([
          JobPosting.find(filter).select("description  title slug jobType   category expertId").populate("expertId","fullname designation")
        .skip(skip)
        .limit(limit)
        .lean()

,

JobPosting.countDocuments(filter)

           ])


           return res.status(200).json({
           success: true,
      jobs,
      pagination:{
        page,
        limit,
        total:totalJobs,
        totalPage: Math.ceil(totalJobs/limit),
        hasNextPage: page < Math.ceil(totalJobs / limit),
        hasPrevPage: page > 1,
      }
           })





    } catch (error) {
        next(error)
    }
}

export const getSingleJob = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const jobSlug = req.params.slug;
        const job = await JobPosting.findOne({slug:jobSlug,rejected:false}).select("-rejectionReason -applydUser").populate("expertId","fullname email image  designation specialization")

        if(!job){ return res.status(404).json({success:false,message:"Job not Found"})}
               job.views= job.views+1
           await job.save()

        return res.status(200).json({success:true,job})

           } catch (error) {
        next(error)
               }
}
interface IAuth extends Request{
  user: any
}

export const applyforJob = async (req:IAuth,res:Response,next:NextFunction)=>{
    try {
        const userId = req.user._id;
    const jobId = req.params.id;

  const user = await User.findById(userId)
if(!user){
     return res.status(404).json({
        success: false,
        message: "User not found",
      });   
}

    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

  if (job.status !== "PUBLISHED") {
      return res.status(400).json({
        success: false,
        message: "This job is not currently accepting applications",
      });
    }
      if (job.rejected) {
      return res.status(400).json({
        success: false,
        message: "This job has been rejected",
      });
    }
   const alreadyApplied = job.applydUser?.some(
      (applicant) => applicant.user.toString() === userId.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }
   job.applydUser.push({
      user: user._id,
      resume: user.resume || "",
    });
job.applicationsCount = (job.applicationsCount || 0) + 1;

 user?.jobappled?.push(job._id);
await Promise.all([
      user.save(),
      job.save(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Job application submitted successfully",
    });

    } catch (error) {
        next(error)
    }
}







