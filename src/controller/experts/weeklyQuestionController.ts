import type { NextFunction, Request, Response } from "express";
import { removeImage } from "../../helper/deleteImage";
import WeeklyChallenge from "../../model/ExpertQuestionModel"
import ChallengeAnswer from "../../model/ChallengeAnswerSchema"
import { Champion } from "../../model/champianModel";

const DeletImg=async(thumbnailPath :string | null)=>{
   if(thumbnailPath){
          await removeImage(thumbnailPath)
        }
}

interface IAuth extends Request{
    expert :any
}


export const createQuestion = async(req:IAuth,res:Response,next:NextFunction)=>{
    const image = req.file as Express.Multer.File || undefined;
       const imagePath = image
       ? `/uploads/challenges/${image.filename}`
        : "";

    try {
        const expertId = req.expert?._id;

        const {question}= req.body
     if(!question){
        DeletImg(imagePath)
       return res.status(200).json({
        success:false,
        message:"Question required",
    })
}

    const questionCreated= await WeeklyChallenge.create(({
expertId,question,referenceImages:imagePath || null
    }))


    return res.status(201).json({success:true,message:"Question created"})



//    const timeZone = "Asia/Kolkata";
//    const formatter = new Intl.DateTimeFormat("en-US", {
//   timeZone,
//   weekday: "short",
//   year: "numeric",
//   month: "2-digit",
//   day: "2-digit",
// });


// const parts = formatter.formatToParts(new Date());
// const weekday = parts.find((p) => p.type === "weekday")?.value;

// if(weekday !== "Sat"){
//     return res.status(302).json({
//         success:false,message:"You only post Question on saturday"
//     })
// }















    } catch (error) {
     DeletImg(imagePath)
     next(error)   
    }
}


export const GetMyQuestion = async(req:IAuth,res:Response,next:NextFunction)=>{
    try {
const expertId = req.expert?._id;
    
const allQuestion = await WeeklyChallenge.find({expertId}).select("question referenceImages status ");

return res.status(200).json({success:true,data:allQuestion})



          
    } catch (error) {
        next(error)
    }
}

export const DeleteQuestion = async(req:IAuth,res:Response,next:NextFunction)=>{
try {
const expertId = req.expert?._id;

    const questionId = req.params.id

    const questionfind = await WeeklyChallenge.findOne({_id:questionId,expertId});

    if(!questionfind){
        return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if(questionfind?.status !== "DRAFT"){
  return res.status(400).json({
        success: false,
        message: "Only draft questions can be deleted",
      });

    }

if(questionfind?.referenceImages){
   DeletImg(questionfind.referenceImages as string)
}

await questionfind.deleteOne()

     return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
} catch (error) {
    next(error)
}

}

export const getWeeklyQuestion= async(req:IAuth,res:Response,next:NextFunction)=>{
    try {
        const expertId = req.expert?._id;
        const questionId = req.params.id;
        const question = await WeeklyChallenge.findOne({_id:questionId,expertId});
        
        if(!question){
             return res.status(404).json({
        success: false,
        message: "Weekly question not found",
      });
        }

const answers = await ChallengeAnswer.find({challengeId:questionId}).select("answer");


return res.status(200).json({
      success: true,
      question,
      answers,
      totalAnswers: answers.length,
    });


    } catch (error) {
        next(error)
    }
}


export  const AddbestAns = async(req:IAuth,res:Response,next:NextFunction)=>{
    try {
        const {answerId}= req.body
        const questionId= req.params.id
        const expertId = req.expert?._id;
        if (!answerId) {
      return res.status(400).json({
        success: false,
        message: "Answer ID is required",
      });
    }
  if (!questionId || !expertId) {
      return res.status(400).json({
        success: false,
        message: "Invalid challenge",
      });
    }


 const question = await WeeklyChallenge.findOne({
      _id: questionId,
      expertId,
    });
    
    
    if(!question){
     return res.status(404).json({
        success: false,
        message: "Challenge not found",
      });
          }

 

 if (question.status !== "SUBMISSION_CLOSED") {
      return res.status(400).json({
        success: false,
        message:
          "Best answer can only be selected after submissions are closed",
      });
    }
 const answer = await ChallengeAnswer.findOne({
      _id: answerId,
      challengeId: questionId,
    });

   if (!answer) {
      return res.status(404).json({
        success: false,
        message: "Answer not found",
      });
    }

 if (question.bestAnswerId) {
      await ChallengeAnswer.updateOne(
        {
          _id: question.bestAnswerId,
          challengeId: questionId,
        },
        {
          $set: {
            isBestAnswer: false,
          },
        }
      );
    }

     await ChallengeAnswer.updateOne(
      {
        _id: answer._id,
        challengeId: questionId,
      },
      {
        $set: {
          isBestAnswer: true,
        },
      }
    );
  question.bestAnswerId = answer._id;
    question.championUserId = answer.userId;
 await question.save();


    return res.status(200).json({
      success: true,
      message: "Best answer selected successfully",
      bestAnswerId: answer._id,
      championUserId: answer.userId,
    });
    } catch (error) {
        next(error)
    }
}


export const AnnounceResult = async (
  req: IAuth,
  res: Response,
  next: NextFunction
) => {
  try {
    const questionId = req.params.id;
    const expertId = req.expert?._id;

    const question = await WeeklyChallenge.findOne({
      _id: questionId,
      expertId,
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found",
      });
    }

    if (question.status !== "SUBMISSION_CLOSED") {
      return res.status(400).json({
        success: false,
        message:
          "Challenge must be in SUBMISSION_CLOSED status",
      });
    }

    if (!question.bestAnswerId) {
      return res.status(400).json({
        success: false,
        message: "Please select a best answer first",
      });
    }

    if (!question.correctAnswer?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please add the correct answer first",
      });
    }


    const bestAnswer = await ChallengeAnswer.findOne({
      _id: question.bestAnswerId,
      challengeId: questionId,
    });

    if (!bestAnswer) {
      return res.status(404).json({
        success: false,
        message: "Best answer not found",
      });
    }

    question.championUserId = bestAnswer.userId;
    question.status = "RESULT_ANNOUNCED";
    question.resultAnnouncedAt = new Date();
    
    await question.save();
    
    
    const startDate = new Date(question.startDate as Date);
    const endDate = new Date(question.submissionDeadline  as Date);
    


  await Champion.create({
    userId:bestAnswer.userId,type:"WEEK",periodStart:startDate,periodEnd:endDate,challengeId:question._id,answerId:bestAnswer._id,title:"Champion of the Week"
  })




    return res.status(200).json({
      success: true,
      message: "Challenge result announced successfully",
      question,
    });
  } catch (error) {
    next(error);
  }
};
export const correctAnswer = async (
  req: IAuth,
  res: Response,
  next: NextFunction
) => {
  try {
    const questionId = req.params.id;
    const expertId = req.expert?._id;
    const {correctAnswer} = req.body
    const question = await WeeklyChallenge.findOne({
      _id: questionId,
      expertId,
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found",
      });
    }

    if (question.status !== "SUBMISSION_CLOSED") {
      return res.status(400).json({
        success: false,
        message:
          "Challenge must be in SUBMISSION_CLOSED status",
      });
    }

 

    question.correctAnswer = correctAnswer
 

    await question.save();

    return res.status(200).json({
      success: true,
      message: "Challenge result announced successfully",
      question,
    });
  } catch (error) {
    next(error);
  }
};



export const dashActiveQuestion=async(req: IAuth,res: Response,next: NextFunction)=>{
try {
    const expertId = req.expert?._id;
    
    const question = await WeeklyChallenge.findOne({status:"ACTIVE"}) .select(
        "expertId question referenceImages startDate submissionDeadline status"
      )
      .populate(
        "expertId",
        "fullname image designation qualification linkedinUrl"
      );

   if (!question) {
      return res.status(404).json({
        success: false,
        message: "No active weekly question found",
      });
    }



    const yours= question?.expertId._id.toString()===expertId.toString();

const answerCount = await ChallengeAnswer.countDocuments({challengeId:question._id}) || 0;


   
    return res.status(200).json({
      success: true,
    data:{
          question,
      yours,
      answerCount,
    }
    });


} catch (error) {
    next(error)
}
  }
