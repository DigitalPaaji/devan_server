import  type { NextFunction, Request, Response } from "express";
import redisClient from "../../helper/redisServer";
import { Event } from "../../model/expertEventModel";



export const getHompageEvent = async(req:Request,res:Response,next:NextFunction)=>{
try {
    const key=`devan-events`
    const cacheEvent = await redisClient.get(key)
    if(cacheEvent){
        return res.status(200).json({
            success:true,
            events:JSON.parse(cacheEvent)
        })
    }

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
      success: true,
      events,
    });
} catch (error) {
next(error)
}
}


export const getEvents = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const page = Number(req.query.page) || 1
        const limit= Number(req.query.limit) || 20;
        const skip = limit * (page - 1);
        const search = typeof req.query.search === "string" ? req.query.search.trim(): "";
         const status = typeof req.query.status === "string"? req.query.status: "PUBLISHED";


        const filter:any  ={
            status
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
          venue: {
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
      ];
        }
         


           const [events,totalEvents] = await Promise.all([
Event.find(filter).select("title expertId slug image venue date").populate("expertId","fullname designation").sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()

,

Event.countDocuments(filter)

           ])


           return res.status(200).json({
           success: true,
      events,
      pagination:{
        page,
        limit,
        total:totalEvents,
        totalPage: Math.ceil(totalEvents/limit),
        hasNextPage: page < Math.ceil(totalEvents / limit),
        hasPrevPage: page > 1,
      }
           })





    } catch (error) {
        next(error)
    }
}

export const getSingleEvent = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const EventSlug = req.params.slug;
        const event = await Event.findOne({slug:EventSlug,  status: {
    $in: ["PUBLISHED", "COMPLETED"],
  },}).select("-rejectionReason").populate("expertId","fullname email image  designation specialization").lean()

if(!event){
return res.status(404).json({success:false,message:"Event not Found"})
}

return res.status(200).json({success:true,event})

    } catch (error) {
        next(error)
    }
}

