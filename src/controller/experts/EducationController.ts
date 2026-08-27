import type { NextFunction, Request, Response } from "express"
import { ExpertEducation } from "../../model/expertEducation";

interface IAuth extends Request{
    expert :any
}
 export const createEducation = async(req:IAuth,res:Response,next:NextFunction)=>{
try {
 const expertId = req.expert?._id;
 const {category,ytlink,status} = req.body;

 if (!expertId) {
      return res.status(401).json({
        success: false,
        message: "Expert authentication required",
      });
    }
     if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (!ytlink) {
      return res.status(400).json({
        success: false,
        message: "YouTube link is required",
      });
    }

  const education = await  ExpertEducation.create({expertId,
    category,ytlink,status
  })


 return res.status(201).json({
      success: true,
      message: "Education created successfully",
      data: education,
    });


} catch (error) {
  next(error)  
}


}


export const fetchEducation = async(req:IAuth,res:Response,next:NextFunction)=>{
try {
  const expertId = req.expert?._id;
 if (!expertId) {
      return res.status(401).json({
        success: false,
        message: "Expert authentication required",
      });
    }


  const educations = await  ExpertEducation.find({expertId})
  
  

 return res.status(200).json({
      success: true,
  
      data: educations,
    });



} catch (error) {
  next(error)
}

}

export const DeleteEduc = async(req:IAuth,res:Response,next:NextFunction)=>{
  try {
const {eduid}= req.params

const expertId = req.expert?._id;
 await ExpertEducation.deleteOne({_id:eduid,expertId })


return res.status(200).json({success:true,message:"Delete"})
    
  } catch (error) {
    next(error)
  }
}

export const UpdateEduc = async(req:IAuth,res:Response,next:NextFunction)=>{
  try {
    const {eduid}= req.params

const expertId = req.expert?._id;
 const {category,ytlink,status} = req.body;
  if (!expertId) {
      return res.status(401).json({
        success: false,
        message: "Expert authentication required",
      });
    }

    // --------------------------------
    // Education ID validation
    // --------------------------------
    if (!eduid) {
      return res.status(400).json({
        success: false,
        message: "Education ID is required",
      });
    }
 const education=  await ExpertEducation.findOne({_id:eduid,expertId })

   if (!education) {
      return res.status(404).json({
        success: false,
        message: "Education not found",
      });
    }

if (category !== undefined) {
      education.category = category;
    }

    if (ytlink !== undefined) {
      education.ytlink = ytlink;
    }

    if (status !== undefined) {
      education.status = status;
    }



 await education.save();;




 return res.status(200).json({
      success: true,
      message: "Education updated successfully",
      data: education,
    });


  } catch (error) {
    next(error)
  }
}

