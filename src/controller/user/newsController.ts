import  type { NextFunction, Request, Response } from "express";
import redisClient from "../../helper/redisServer";
import { News } from "../../model/expertNews";

export const getHomepageNews = async(req:Request,res:Response,next:NextFunction)=>{
    try {
         const key=`devan-news`
    const cacheNews = await redisClient.get(key)
    if(cacheNews){
        return res.status(200).json({
            success:true,
            news:JSON.parse(cacheNews)
        })
    }
    
    const news = await News.find({homepage: true,rejected:false}).select("featuredImage title slug publicationDate  category expertId").populate("expertId","fullname designation")


     await redisClient.set(
      key,
      JSON.stringify(news),
      {
        EX: 300,
      }
    );
 return res.status(200).json({
      success: true,
      news,
    });
    } catch (error) {
      next(error)  
    }
}


export const getNews = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const page = Number(req.query.page) || 1
        const limit= Number(req.query.limit) || 20;
        const skip = limit * (page - 1);
        const search = typeof req.query.search === "string" ? req.query.search.trim(): "";


        const filter:any  ={
           rejected:false 
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
      ];
        }
         


           const [news,totalNews] = await Promise.all([
News.find(filter).select("featuredImage title slug publicationDate  category expertId").populate("expertId","fullname designation")
        .skip(skip)
        .limit(limit)
        .lean()

,

News.countDocuments(filter)

           ])


           return res.status(200).json({
           success: true,
      news,
      pagination:{
        page,
        limit,
        total:totalNews,
        totalPage: Math.ceil(totalNews/limit),
        hasNextPage: page < Math.ceil(totalNews / limit),
        hasPrevPage: page > 1,
      }
           })





    } catch (error) {
        next(error)
    }
}

export const getSingleNews = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const newsSlug = req.params.slug;
        const news = await News.findOne({slug:newsSlug,rejected:false}).select("-rejectionReason").populate("expertId","fullname email image  designation specialization").lean()

if(!news){
return res.status(404).json({success:false,message:"News not Found"})
}

return res.status(200).json({success:true,news})

    } catch (error) {
        next(error)
    }
}


