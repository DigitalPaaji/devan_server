import  type { NextFunction, Request, Response } from "express";
import { Event } from "../../model/expertEventModel";
import redisClient from "../../helper/redisServer";


export const getEvents = async(req:Request,res:Response,next:NextFunction)=>{
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

const status = req.query.status || ""

  
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
          venue: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if(status){
        filter.status=status
    }

const [events, totalEvents] = await Promise.all([
      Event.find(filter)
        .select("expertId title email  venue status date").populate("expertId","fullname ")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Event.countDocuments(filter),
    ]);


      return res.status(200).json({
      success: true,
      message: "events fetched successfully",

      events,

      pagination: {
        totalEvents,
        totalPages: Math.ceil(totalEvents / limit),
        currentPage: page,
        limit,
      },
    });


    } catch (error) {
      next(error)  
    }
}


export const GetSingleEvent=async(req:Request,res:Response,next:NextFunction)=>{
  try {
    const EventId = req.params.id;
    const event = await Event.findById(EventId).populate("expertId","fullname email phone image about")
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Event fetched successfully",
      event,
    });

  } catch (error) {
    next(error)
  }
}




export const UpdateEvent =async(req:Request,res:Response,next:NextFunction)=>{
  try {
    const EventId = req.params.id;
    const {value} = req.body
    const event = await Event.findById(EventId)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

event.status = value;

await event.save()

return res.status(200).json({success:true,message:"Event Status Updated"})


  } catch (error) {
    next(error)
  }

}





export const cancelEvent =async(req:Request,res:Response,next:NextFunction)=>{
  try {
    const EventId = req.params.id;
    const {reason} = req.body
    const event = await Event.findById(EventId)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
event.rejectionReason=reason;
event.status = "CANCELLED";
event.homepage= false;
await event.save()

return res.status(200).json({success:true,message:"Event Status Cancelled"})


  } catch (error) {
    next(error)
  }

}

export const AddtohomePageEvent = async(req:Request,res:Response,next:NextFunction)=>{
  try {
        const EventId = req.params.id;
         const {homepage} = req.body
       const event = await Event.findById(EventId)

          if (!event) {
           return res.status(404).json({
        success: false,
        message: "Event not found",
          });}

     event.homepage = homepage;
     await event.save()
   const key=`devan-events`
   const events = await Event.find({
      status: "PUBLISHED",
      homepage: true,
    }).select("title expertId slug image venue date").populate("expertId","fullname designation").lean();


     await redisClient.set(
      key,
      JSON.stringify(events),
      {
        EX: 300,
      }
    );


     return res.status(200).json({
      success:true,
      message:"Event Updated"
     })
   

  } catch (error) {
    next(error)
  }
}