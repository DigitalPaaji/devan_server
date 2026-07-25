import type { NextFunction, Request, Response } from "express"
import slugify from "slugify"
import { prisma } from "../../config/database";

interface IAuth extends Request{
    user :any
}

export const CreatreArticles = async(req:IAuth,res:Response,next:NextFunction)=>{
    try {
const {title,shortDescription,category,status} = req.body;
const thumbnail = req.file as Express.Multer.File || undefined;
  const expertId = Number(req.user?.id);

    if (!expertId) {
      return res.status(401).json({
        success: false,
        message: "Expert authentication required",
      });
    }

   if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Article title is required",
      });
    }
    const tags =  JSON.parse(req.body.tags || [ ])
    
 const baseSlug = slugify(title, {
      lower: true,
      strict: true,
      trim: true,
    });

const slug = `${baseSlug}-${Date.now()}`;

  const thumbnailPath = thumbnail
      ? `/uploads/articles/${thumbnail.filename}`
      : null;
    const article = await prisma.expertArticle.create({
       data: {
        expertId,
        title: title.trim(),
        slug,
        shortDescription: shortDescription?.trim() || null,
        category: category?.trim() || null,
        tags: tags,
        content:[],
        thumbnail: thumbnailPath,
        status,
      },
    });
        return res.status(201).json({
      success: true,
      message:
        status === "DRAFT"
          ? "Article saved as draft"
          : "Article submitted ",
      article:article.id,
    });
    } catch (error) {
        next(error)
    }
}

export const CreateDes = async(req:IAuth,res:Response,next:NextFunction)=>{
  try {
    const {title,des,color ,articleid}= req.body;
    const expertId = Number(req.user?.id);
    const thumbnail = req.file as Express.Multer.File || undefined; 
   

    const findArticle = await prisma.expertArticle.findUnique({where:{id:articleid}});
    const thumbnailPath = thumbnail
      ? `/uploads/articles/${thumbnail.filename}`
      : null;
const newDes= {
  title,des,color,image: thumbnailPath
}






  } catch (error) {
    
  }
}

