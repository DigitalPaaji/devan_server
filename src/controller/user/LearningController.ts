import type { NextFunction, Request, Response } from "express";
import redisClient from "../../helper/redisServer";
import ExpertArticle from "../../model/experArticalModel";
import { ExpertEducation } from "../../model/expertEducation";


export const getHomeArticle = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const key ="devan-article"
      const cacheArticle= await redisClient.get(key);
      if(cacheArticle){
        return res.status(200).json({success:true,article:JSON.parse(cacheArticle)})
      }

    
    const article = await ExpertArticle.find({homepage:true,status:"PUBLISHED"}).select("expertId title slug  shortDescription thumbnail category ").populate("expertId","fullname designation")
     await redisClient.set(key,JSON.stringify(article),{
        EX:300
     })

     return res.status(200).json({success:true,article})





    } catch (error) {
      next(error)  
    }
}



export const getArticles = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const page = Number(req.query.page) || 1
        const limit= Number(req.query.limit) || 20;
        const skip = limit * (page - 1);
        const search = typeof req.query.search === "string" ? req.query.search.trim(): "";


        const filter:any  ={
            status:"PUBLISHED"
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
          shortDescription: {
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
         


           const [articles,totalArticles] = await Promise.all([
ExpertArticle.find(filter).select("expertId title slug  shortDescription thumbnail category ").populate("expertId","fullname designation")
        .skip(skip)
        .limit(limit)
        .lean()

,

ExpertArticle.countDocuments(filter)

           ])


           return res.status(200).json({
           success: true,
      articles,
      pagination:{
        page,
        limit,
        total:totalArticles,
        totalPage: Math.ceil(totalArticles/limit),
        hasNextPage: page < Math.ceil(totalArticles / limit),
        hasPrevPage: page > 1,
      }
           })





    } catch (error) {
        next(error)
    }
}

export const getSingleArticles = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const articlesSlug = req.params.slug;
        const article = await ExpertArticle.findOne({slug:articlesSlug,  status:"PUBLISHED"}).select("-rejectionReason").populate("expertId","fullname email image  designation specialization")

if(!article){
return res.status(404).json({success:false,message:"Article not Found"})
}
++article.views

await article.save()

return res.status(200).json({success:true,article})

    } catch (error) {
        next(error)
    }
}




export const getHomeYT = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const key ="devan-yt"
      const cacheYt= await redisClient.get(key);
      if(cacheYt){
        return res.status(200).json({success:true,ytvideos:JSON.parse(cacheYt)})
      }

    
    const ytvideos = await ExpertEducation.find({homepage:true,status:"PUBLISHED"}).select("expertId  category ytlink ").populate("expertId","fullname designation")
     await redisClient.set(key,JSON.stringify(ytvideos),{
        EX:300
     })

     return res.status(200).json({success:true,ytvideos})





    } catch (error) {
      next(error)  
    }
}


export const getYtvideos = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const page = Number(req.query.page) || 1
        const limit= Number(req.query.limit) || 20;
        const skip = limit * (page - 1);
        const search = typeof req.query.search === "string" ? req.query.search.trim(): "";


        const filter:any  ={
            status:"PUBLISHED"
        }

        if(search){
        filter.$or = [
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
        }
         


           const [ytvideos,totalYTvideos] = await Promise.all([
                      ExpertEducation.find({homepage:true,status:"PUBLISHED"}).select("expertId  category ytlink ").populate("expertId","fullname designation")
        .skip(skip)
        .limit(limit)
        .lean(),
                       ExpertEducation.countDocuments(filter)

           ])


           return res.status(200).json({
           success: true,
      ytvideos,
      pagination:{
        page,
        limit,
        total:totalYTvideos,
        totalPage: Math.ceil(totalYTvideos/limit),
        hasNextPage: page < Math.ceil(totalYTvideos / limit),
        hasPrevPage: page > 1,
      }
           })





    } catch (error) {
        next(error)
    }
}
