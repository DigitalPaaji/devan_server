import type { NextFunction, Request, Response } from "express";
import WeeklyChallenge from "../../model/ExpertQuestionModel"



export const getChallenges = async( req: Request,res: Response,next: NextFunction)=>{
try {
    const page =  Math.max(Number(req.query.page) || 1, 1);
    const limit =20;
    const skip = limit * (page - 1)
      
    const status = req.query.status as string | undefined;

    const filter: Record<string, any> = {};

    if (status) {
      filter.status = status;
    }

    const [challenges,total] = await Promise.all([

WeeklyChallenge.find(filter)
  .select("question expertId referenceImages status startDate submissionDeadline")
  .populate("expertId", "fullname email image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      WeeklyChallenge.countDocuments(filter),

    ])
    

  return res.status(200).json({
      success: true,
      data: challenges,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    });


} catch (error) {
    next(error)
}
}


export const updateStatus= async( req: Request,res: Response,next: NextFunction)=>{
  try {
    const {questionId,status} = req.body;
     
   if (!questionId || !status) {
      return res.status(400).json({
        success: false,
        message: "questionId and status are required",
      });
    }

    const question = await WeeklyChallenge.findById(questionId);
      if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }
    question.status =status;

   await question.save();

    return res.status(200).json({
      success: true,
      message: "Question status updated successfully",
    });
  } catch (error) {
        next(error);

  }
}

export const selectQuestion= async( req: Request,res: Response,next: NextFunction)=>{
  try {
 const {start,end,questionId}= req.body;

const alreadyActive = await WeeklyChallenge.findOne({status:"ACTIVE"});

if(alreadyActive){
  return res.status(404).json({success:false,message:"One Question is allready active"})
}


const question = await WeeklyChallenge.findById(questionId)


  if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

question.startDate= start
question.submissionDeadline= end
question.status= "ACTIVE"


await question.save()

return res.status(200).json({success:true,message:"question is active"})    


  } catch (error) {
    next(error)
  }
}





