import type { NextFunction, Request, Response } from "express"
import WeeklyChallenge from "../../model/ExpertQuestionModel"
import ChallengeAnswer from "../../model/ChallengeAnswerSchema"
import redisClient from "../../helper/redisServer";


const WEEKLY_QUESTION_CACHE_KEY = "weekly_challenge:active";
const WEEKLY_QUESTION_CACHE_TTL = 60 * 5; 


const getActiveWeeklyQuestion = async () => {
    const cachedQuestion = await redisClient.get(
    WEEKLY_QUESTION_CACHE_KEY
  );
   if (cachedQuestion) {
    return JSON.parse(cachedQuestion);
  }

   const activeQuestion = await WeeklyChallenge.findOne({
    status: "ACTIVE",
  })
    .select(
      "expertId question referenceImages startDate submissionDeadline status"
    )
    .populate(
      "expertId",
      "fullname image designation qualification linkedinUrl"
    )
    .lean();

     if (!activeQuestion) {
    return null;
  }

  // 3. Store in Redis
  await redisClient.setEx(
    WEEKLY_QUESTION_CACHE_KEY,
    WEEKLY_QUESTION_CACHE_TTL,
    JSON.stringify(activeQuestion)
  );
    return activeQuestion;
}










interface IAuth extends Request{
  user: any
}

export const submitAnswer=async(req:IAuth,res:Response,next:NextFunction)=>{
    try {
     const userId = req.user._id;
     const {answer,questionId}=req.body;
  if (!questionId || !answer?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question ID and answer are required",
      });
    }

 const activeQuestion = await WeeklyChallenge.findOne({
      _id: questionId,
      status: "ACTIVE",
    });
    if (!activeQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question inactive or not found",
      });
    }

 const alreadyAnswer = await ChallengeAnswer.findOne({
      challengeId: activeQuestion._id,
      userId,
    });

    if (alreadyAnswer) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted an answer",
      });
    }




const newAnswer = await ChallengeAnswer.create({
      challengeId: activeQuestion._id,
      userId,
      answer: answer.trim(),
    });




         return res.status(201).json({
      success: true,
      message: "Answer submitted successfully",
      answer: newAnswer,
    });


    } catch (error) {
        next(error)
    }
}

export const getWeeklyQuestionUser = async(req:IAuth,res:Response,next:NextFunction)=>{
    try {
     const userId = req.user._id;
    const activeQuestion = await getActiveWeeklyQuestion();
if(!activeQuestion){
      return res.status(404).json({
        success: false,
        message: "No active weekly question found",
      });
}



const alreadyAnswer = await ChallengeAnswer.findOne({
      challengeId: activeQuestion._id,
      userId,
    }).select("answer");


    


return res.status(200).json({
     success: true,
      question: activeQuestion,
      alreadyAnswer,
      hasAnswered: !!alreadyAnswer,
})


    } catch (error) {
        next(error)
    }
}

export const getWeeklyQuestionAll = async(req:Request,res:Response,next:NextFunction)=>{
    try {
    const activeQuestion = await getActiveWeeklyQuestion();
if(!activeQuestion){
      return res.status(404).json({
        success: false,
        message: "No active weekly question found",
      });
}





    


return res.status(200).json({
     success: true,
      question: activeQuestion,
      alreadyAnswer:null,
      hasAnswered:false,
})


    } catch (error) {
        next(error)
    }
}
