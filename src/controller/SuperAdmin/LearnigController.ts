import type { NextFunction, Request, Response } from "express";
import ExpertArticle from "../../model/experArticalModel";
import { ExpertEducation } from "../../model/expertEducation";
import redisClient from "../../helper/redisServer";


export const getArticles = async(req:Request,res:Response,next:NextFunction)=>{
try {
    const page= Number(req.query.page) || 1;
    const limit = 20;
    const skip = limit * (page - 1)
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
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
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }
    if(category){
        filter.category=category
     }


const [articles,totalArticles]= await Promise.all([
    ExpertArticle.find(filter).select("expertId  title thumbnail category status views").populate("expertId","fullname")   .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
        ExpertArticle.countDocuments(filter)
]);

 
 return res.status(200).json({
      success: true,
      message: "Articles fetched successfully",

      articles,

      pagination: {
        totalArticles,
        totalPages: Math.ceil(totalArticles / limit),
        currentPage: page,
        limit,
      },
    });




} catch (error) {
    next(error)
}
}



export const getSingleArticle = async(req:Request,res:Response,next:NextFunction)=>{
try {
const articleId = req.params.id;


const article = await ExpertArticle.findById(articleId).populate("expertId","fullname email phone image about")

if(!article){
   return res.status(404).json({
        success: false,
        message: "Article not found",
      });
}
  return res.status(200).json({
      success: true,
      message: "Article fetched successfully",
      article,
    });
} catch (error) {
    next(error)
}

}


export const TogglHompage = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const articleId = req.params.id;


const article = await ExpertArticle.findById(articleId)

if(!article){
   return res.status(404).json({
        success: false,
        message: "Article not found",
      });
}

if(article.status=="REJECTED"){
 return res.status(404).json({
        success: false,
        message: "Article Status is rejected",
      });
 
}
article.homepage= !article.homepage;


 await article.save()

 const key ="devan-article"

 const allhome=  await  ExpertArticle.find({homepage:true,status:"PUBLISHED"}).select("expertId title slug  shortDescription thumbnail category ").populate("expertId","fullname designation")

  await redisClient.set(key,JSON.stringify(allhome),{
        EX:300
     })

 return res.status(200).json({success:true,message:"Article Updated"})

        
    } catch (error) {
        next(error)
    }
}

export const RejectArticle =async(req:Request,res:Response,next:NextFunction)=>{
    try {
  const {rejectionReason,status}= req.body
  const articleId = req.params.id;


   const article = await ExpertArticle.findById(articleId)

   if(!article){
   return res.status(404).json({
        success: false,
        message: "Article not found",
      })}

      if(status==="PUBLISHED"){
article.status=status;
article.rejectionReason="";

      }else{
article.status=status;
article.rejectionReason=rejectionReason;
article.homepage = false;
      }


await article.save();

return res.status(200).json({success:true,message:"Article rejected"})



    } catch (error) {
        next(error)
    }
}






export const getYtVideos = async(req:Request,res:Response,next:NextFunction)=>{
try {
   const page= Number(req.query.page) || 1;
    const limit = 20;
    const skip = limit * (page - 1)
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
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
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }
    if(category){
        filter.category=category
     }

const [yt,totalYt]= await Promise.all([
ExpertEducation.find(filter).populate("expertId","fullname"),
ExpertEducation.countDocuments(filter)
])


    return res.status(200).json({
      success: true,
      message: "Yt fetched successfully",

      yt,

      pagination: {
        totalYt,
        totalPages: Math.ceil(totalYt / limit),
        currentPage: page,
        limit,
      },
    });
 


} catch (error) {
    next(error)
}

}


export const setHomePageYt=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const YtID = req.params.id
        const {homepage} = req.body
    const  yt = await ExpertEducation.findById(YtID)
if(!yt){
     return res.status(404).json({
        success: false,
        message: "Youtube video not found",
      });
}

if(yt.status=="REJECTED"){
       return res.status(404).json({
        success: false,
        message: "Youtube video status Rejected",
      });
}
yt.homepage= homepage;

await yt.save()
return res.status(200).json({success:true,message:"Yt Up-dated"})


    } catch (error) {
        next(error)
    }
}
export const RejectYt=async(req:Request,res:Response,next:NextFunction)=>{
    try {
         const Ytid = req.params.id;
         const {status,rejectionReason} = req.body
         const ytvid = await ExpertEducation.findById(Ytid);
          if(!ytvid){
     return res.status(404).json({
        success: false,
        message: "Youtube video not found",
               });}

        if(status=="PUBLISHED"){
            ytvid.status = status
            ytvid.rejectionReason=""
        }else{
            ytvid.status = status
            ytvid.rejectionReason=rejectionReason
            ytvid.homepage = false

        }
         await ytvid.save()

return res.status(200).json({success:true,message:"Yt video updated"})

    } catch (error) {
        next(error)
    }
}





