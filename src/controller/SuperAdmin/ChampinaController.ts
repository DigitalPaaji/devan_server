import  type { NextFunction, Request, Response } from "express";
import { removeImage } from "../../helper/deleteImage";
import User from "../../model/userModel";
import WeeklyChallenge from "../../model/ExpertQuestionModel";
import WeeklyAnswer from "../../model/ChallengeAnswerSchema";
import { Champion, ChampionType } from "../../model/champianModel";



const DeletImg=async(thumbnailPath :string | null)=>{
   if(thumbnailPath){
          await removeImage(thumbnailPath)
        }
}



export const creatChampion = async(req:Request,res:Response,next:NextFunction)=>{

    const image = req.file as Express.Multer.File || undefined;
 const imagePath = image ? `/uploads/certificate/${image.filename}`: null;


    try {
const {userId,type,description,periodStart,periodEnd} = req.body



if (!userId || !type  || !periodStart || !periodEnd ) {
    DeletImg(imagePath)
      return res.status(400).json({
        success: false,
        message:
          "userId, type, periodStart and periodEnd are required",
      });
    }
    const allowedTypes = [ "MONTH", "YEAR"];

 if (!allowedTypes.includes(type)) {
DeletImg(imagePath)
      return res.status(400).json({
        success: false,
        message: "Invalid champion type",
      });
    }

 const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);
        

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        DeletImg(imagePath)
      return res.status(400).json({
        success: false,
        message: "Invalid periodStart or periodEnd",
      });
    }
     const user = await User.findById(userId).select("_id");

if (!user) {
    DeletImg(imagePath)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

  const existingChampion = await Champion.findOne({
      type,
      periodStart: startDate,
      periodEnd: endDate,
    });

     if (existingChampion) {
        DeletImg(imagePath)
      return res.status(409).json({
        success: false,
        message: `Champion of the ${type.toLowerCase()} already exists for this period`,
      });
    }
const champion = await Champion.create({
      userId,
      type,
      description: description?.trim() || null,
      image: imagePath,
      periodStart: startDate,
      periodEnd: endDate,
      isActive: true,
    });
  return res.status(201).json({
      success: true,
      message: "Champion created successfully",
      champion,
    });

    } catch (error) {
        DeletImg(imagePath)
        next(error)
    }
}

export const getAllChampioUser = async(req:Request,res:Response,next:NextFunction)=>{
try {

    const champtype =  req.params.champtype || "WEEK" as string;
  const allowedTypes: ChampionType[] = ["WEEK", "MONTH", "YEAR"];

     if (!allowedTypes.includes(champtype as ChampionType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid champion type",
      });
    }
    const type = champtype as ChampionType;
    const champions= await Champion.find({type}).populate("answerId","answer").populate("challengeId","question referenceImages correctAnswer").populate("userId","email fullname image ");


  return res.status(200).json({
success:true,
champions,

  })




} catch (error) {
    next(error)
}

}