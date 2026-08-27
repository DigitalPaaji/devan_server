import type { NextFunction, Request, Response } from "express"
import slugify from "slugify"
import ExpertArticle from "../../model/experArticalModel";
import { removeImage } from "../../helper/deleteImage";

interface IAuth extends Request{
    expert :any
}

export const CreatreArticles = async(req:IAuth,res:Response,next:NextFunction)=>{
    try {
const {title,shortDescription,category,status} = req.body;
const thumbnail = req.file as Express.Multer.File || undefined;
  const expertId = req.expert?._id;

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
    const article = await ExpertArticle.create({
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
    );
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
      const thumbnail = req.file as Express.Multer.File || undefined; 

    const thumbnailPath = thumbnail
      ? `/uploads/articles/${thumbnail.filename}`
      : null;
 try {
    const { title, des, color, articleid } = req.body;

    const expertId = req.expert?._id;


    if (!expertId) {
      if (thumbnailPath) {
        await removeImage(thumbnailPath);
      }

      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }


    if (!articleid) {
      if (thumbnailPath) {
        await removeImage(thumbnailPath);
      }

      return res.status(400).json({
        success: false,
        message: "Article ID is required",
      });
    }

   
    const findArticle = await ExpertArticle.findOne({
      _id: articleid,
      expertId: expertId,
    });

    if (!findArticle) {
      if (thumbnailPath) {
        await removeImage(thumbnailPath);
      }

      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

  
    const newDes = {
      title: title?.trim() || null,
      des: des?.trim() || null,
      color: color?.trim() || null,
      image: thumbnailPath,
    };

    // Add content block
    findArticle.content.push(newDes);

  
    await findArticle.save();

    return res.status(201).json({
      success: true,
      message: "Article content created successfully",
      content: newDes,
      article: findArticle.content,
    });
  } catch (error) {
   
    if (thumbnailPath) {
      await removeImage(thumbnailPath);
    }

    next(error);
  }
}


export const GetArticleDes=async(req:IAuth,res:Response,next:NextFunction)=>{
try {
    const { articleid } = req.params;
    const expertId = req.expert?._id;

    if (!expertId) {
      return res.status(401).json({
        success: false,
        message: "Expert authentication required",
      });
    }

    if (!articleid) {
      return res.status(400).json({
        success: false,
        message: "Article ID is required",
      });
    }
    

    const article = await ExpertArticle.findOne({
      _id: articleid,
      expertId,
    }).select("content");

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Article content fetched successfully",
      data: article.content,
    });
  } catch (error) {
    next(error);
  }

}

export const deleteArticle=async(req:IAuth,res:Response,next:NextFunction)=>{
try {
  const { articleid } = req.params;
    const expertId = req.expert?._id;
  if (!expertId) {
      return res.status(401).json({
        success: false,
        message: "Expert authentication required",
      });
    }

    if (!articleid) {
      return res.status(400).json({
        success: false,
        message: "Article ID is required",
      });
    }

    const article = await ExpertArticle.findOne({
      _id: articleid,
      expertId,
    });

     if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }
if(article.thumbnail){
  await removeImage(article.thumbnail)
}



  if (article.content?.length) {
      await Promise.all(
        article.content.map(async (item: any) => {
          if (item.image) {
            await removeImage(item.image);
          }
        })
      );
    }

await article.deleteOne()
 return res.status(200).json({
      success: true,
      message: "Article deleted successfully",
    });
  
} catch (error) {
  next(error)
}

}


export const deleteArticleDes=async(req:IAuth,res:Response,next:NextFunction)=>{
  try {
     const { articleid,desid } = req.params;
    const expertId = req.expert?._id;
  if (!expertId) {
      return res.status(401).json({
        success: false,
        message: "Expert authentication required",
      });
    }

    if (!articleid) {
      return res.status(400).json({
        success: false,
        message: "Article ID is required",
      });
    }
if (!desid) { return res.status(400).json({ success: false, message: "Description ID is required", }); }
        const article = await ExpertArticle.findOne({
      _id: articleid,
      expertId,
    });

     if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

const sectionExists = article.content?.find( (item: any) => item._id?.toString() === desid.toString() );
if (!sectionExists) {return res.status(404).json({ success: false, message: "Article section not found", }); }
if(sectionExists.image){
  await removeImage(sectionExists.image)
}

article.content = article.content.filter( (item: any) => item._id?.toString() !== desid.toString() );

  await article.save()

return res.status(200).json({ success: true, message: "Article section deleted successfully", });

  } catch (error) {
    next(error);
  }
}

const DeletImg=async(thumbnailPath :string | null)=>{
   if(thumbnailPath){
          await removeImage(thumbnailPath)
        }
}



export const UpdateArticleDes=async(req:IAuth,res:Response,next:NextFunction)=>{

const image = req.file as Express.Multer.File || undefined;
 const imagePath = image
      ? `/uploads/articles/${image.filename}`
      : null;

  try {
     const {desid} = req.params;
     const {title,des,color,articleid} = req.body


    const expertId = req.expert?._id;
  if (!expertId) {
DeletImg(imagePath)

      return res.status(401).json({
        success: false,
        message: "Expert authentication required",
      });
    }

    if (!articleid) {
      DeletImg(imagePath)
      return res.status(400).json({
        success: false,
        message: "Article ID is required",
      });
    }
if (!desid) {
  
  DeletImg(imagePath)
  return res.status(400).json({ success: false, message: "Description ID is required", });
 }
        const article = await ExpertArticle.findOne({
      _id: articleid,
      expertId,
    });

     if (!article) {
      DeletImg(imagePath)
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

 
    const mySection = article.content?.find( (item: any) => item._id?.toString() === desid.toString() );
   
if (!mySection) {
      DeletImg(imagePath)
  return res.status(404).json({ success: false, message: "Article section not found", });

}
// title,des,color,
 if (title !== undefined) {
      mySection.title = title;
    }

    if (des !== undefined) {
      mySection.des = des;
    }

    if (color !== undefined) {
      mySection.color = color;
    }

if (imagePath) {
      // Delete old image if exists
      if (mySection.image) {
        DeletImg(mySection.image);
      }

      mySection.image = imagePath;
    }
    await article.save();

return res.status(200).json({ success: true, message: "Article updated successfully",
        section: article.content, });

  } catch (error) {
          DeletImg(imagePath);

    next(error);
  }
}




export const getmyArticles=async(req:IAuth,res:Response,next:NextFunction)=>{
try {
  const expertId =  req.expert._id;
  if (!expertId) {
      return res.status(401).json({
        success: false,
        message: "Expert authentication required",
      });
    }
  const articles = await ExpertArticle.find({ expertId }).select("category status thumbnail views title")
      .sort({ createdAt: -1 })
      .lean();

   return res.status(200).json({
      success: true,
      message: "Articles fetched successfully",
      data: articles,
    });


} catch (error) {
next(error)  
}

}

export const getSingleArticle=async(req:IAuth,res:Response,next:NextFunction)=>{
  try {
      const expertId =  req.expert._id;
  const {articleid} = req.params

  if (!expertId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!articleid) {
      return res.status(400).json({
        success: false,
        message: "Article ID is required",
      });
    }


const article = await ExpertArticle.findOne({expertId,_id:articleid});

  if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

  return res.status(200).json({
      success: true,
      message: "Article fetched successfully",
      data: article,
    });
  } catch (error) {
    next(error)
  }
}





export const UpdateArticle=async(req:IAuth,res:Response,next:NextFunction)=>{
const thumbnail = req.file as Express.Multer.File || undefined;
 const thumbnailPath = thumbnail
      ? `/uploads/articles/${thumbnail.filename}`
      : null;
  try {
    const {articleid}= req.params
     const expertId = req.expert._id
       if (!expertId) {
       DeletImg(thumbnailPath)
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!articleid) {
       DeletImg(thumbnailPath)
      return res.status(400).json({
        success: false,
        message: "Article ID is required",
      });
    }
    const {title,shortDescription,category,status,tags}= req.body
 
    const article = await ExpertArticle.findOne({_id:articleid,expertId});
 if (!article) {
   DeletImg(thumbnailPath)
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    article.title=title
    article.shortDescription=shortDescription
    article.category=category
    article.status=status
    article.tags= JSON.parse(tags) 

if(thumbnailPath){
DeletImg(article?.thumbnail as string)

  article.thumbnail= thumbnailPath
}

await article.save()

return res.status(200).json({success:true,article,message:"Article updated successfully"})


  } catch (error) {
     DeletImg(thumbnailPath)
     next(error)
  }
}
