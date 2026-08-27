import type { NextFunction, Request, Response } from "express";
import { removeImage } from "../../helper/deleteImage";
import slugify from "slugify"
import { Event } from "../../model/expertEventModel";
interface IAuth extends Request{
    expert :any
}




const DeletImg=async(thumbnailPath :string | null)=>{
   if(thumbnailPath){
          await removeImage(thumbnailPath)
        }
}



export const createEvent = async(req:IAuth,res:Response,next:NextFunction)=>{
const image = req.file as Express.Multer.File || undefined;
 const imagePath = image
      ? `/uploads/events/${image.filename}`
      : "";

 
    try {
const {title,description,venue,date,organizer,status}= req.body;
 const expertId = req.expert?._id;


if (!title || !description || !venue || !date || !organizer) {
 DeletImg(imagePath);

      return res.status(400).json({
        success: false,
        message: "Title, description, venue, date and organizer are required",
      });
    }

 const baseSlug = slugify(title, {
      lower: true,
      strict: true,
      trim: true,
    });

const slug = `${baseSlug}-${Date.now()}`;



const event = await Event.create({expertId,
  title,slug,image:imagePath,description,venue,date,organizer:JSON.parse(organizer),status  
})

 return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });


    } catch (error) {
        DeletImg(imagePath)
        next(error)
    }
}


export const getEvent = async(req:IAuth,res:Response,next:NextFunction)=>{
try {
const expertId = req.expert?._id;

const events = await Event.find({expertId}).select("title image date status venue")

return res.status(200).json({
    success:true,
    events
})


    
} catch (error) {
    next(error)
}
}

export const getSingleEvent= async(req:IAuth,res:Response,next:NextFunction)=>{
    try {
        const expertId = req.expert?._id;
        const eventId = req?.params?.id;

         const event = await Event.findOne({_id:eventId,expertId});

         if(!event){
            return res.status(404).json({
                success:false,
                message:"Event not Find"
            })
         }

return res.status(200).json({
    success:true,
    event
})



    } catch (error) {
        next(error)
    }
}



export const editEvent = async(req:IAuth,res:Response,next:NextFunction)=>{
const image = req.file as Express.Multer.File || undefined;
 const imagePath = image
      ? `/uploads/events/${image.filename}`
      : "";

 
    try {
 const {title,description,venue,date,organizer,status}= req.body;
 const expertId = req.expert?._id;
 const eventId = req?.params?.id;


if (!title || !description || !venue || !date || !organizer) {
 DeletImg(imagePath);

      return res.status(400).json({
        success: false,
        message: "Title, description, venue, date and organizer are required",
      });
    }



const event = await Event.findOne({_id:eventId,expertId});

         if(!event){
            return res.status(404).json({
                success:false,
                message:"Event not Find"
            })
         }

event.title=title
event.description=description
event.venue=venue
event.organizer=JSON.parse(organizer)
event.status=status


if(imagePath){
  DeletImg(event.image as string); 
  
  event.image=imagePath
}
event.save()



 return res.status(201).json({
      success: true,
      message: "Event updated successfully",
      event,
    });


    } catch (error) {
        DeletImg(imagePath)
        next(error)
    }
}


export const DeleteEvent = async(req:IAuth,res:Response,next:NextFunction)=>{
    try {
        
       const expertId = req.expert?._id;
 const eventId = req?.params?.id;  

 const event = await Event.findOne({_id:eventId,expertId});

if(!event){
     return res.status(404).json({
                success:false,
                message:"Event not Find"
            })  
}
if(event?.image){
    DeletImg(event.image as string)

}

await event.deleteOne()

  return res.status(200).json({
                success:true,
                message:"Event deleted"
            })  

    } catch (error) {
        next(error)
    }
}