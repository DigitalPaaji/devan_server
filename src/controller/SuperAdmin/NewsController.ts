import  type { NextFunction, Request, Response } from "express";
import redisClient from "../../helper/redisServer";
import { News } from "../../model/expertNews";


export const getNews = async(req:Request,res:Response,next:NextFunction)=>{
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

    if(category){
        filter.category=category
    }

const [news, totalNews] = await Promise.all([
      News.find(filter)
        .select("expertId featuredImage title publicationDate  category ").populate("expertId","fullname ")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      News.countDocuments(filter),
    ]);


      return res.status(200).json({
      success: true,
      message: "News fetched successfully",

      news,

      pagination: {
        totalNews,
        totalPages: Math.ceil(totalNews / limit),
        currentPage: page,
        limit,
      },
    });


    } catch (error) {
      next(error)  
    }
}
export const getNewsSingle= async(req:Request,res:Response,next:NextFunction)=>{
    try {
 const newsId =  req.params.id;

 const news = await News.findById(newsId).populate("expertId","fullname email phone image about")
        
if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "News fetched successfully",
      news,
    });
    } catch (error) {
        next(error)
    }
}
export const rejectNews=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const newsId =  req.params.id;
          const {reason} = req.body

          const news = await News.findById(newsId);
              if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });}
      if(news.rejected){
news.rejectionReason=null;
 news.rejected= false;
      }else{
news.rejectionReason=reason;
 news.rejected= true;
 news.homepage = false;
      }
 
 await news.save();
 return res.status(200).json({success:true,message:"News Status Cancelled"})



    } catch (error) {
        next(error)
    }
}

export const setHome= async(req:Request,res:Response,next:NextFunction)=>{
    try {
 const newsId =  req.params.id;
      
   const news = await News.findById(newsId);
              if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });}
  if(news.rejected){return res.status(404).json({success:false,message:"News Status rejected"})}
   
   news.homepage= !news.homepage

    await news.save()
   
return res.status(200).json({success:true,message:"News updated"})

    } catch (error) {
        next(error)
    }
}


