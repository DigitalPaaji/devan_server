import type { NextFunction, Request, Response } from "express";
import Content from "../../model/WebsiteContent";

export const CreateContent = async(req:Request,res:Response,next:NextFunction)=>{
try {

    const {page,des} = req.body  
    if(!page.trim() || !des){return  res.status(404).json({success:false,message:"page and description required"})   }

    const allreadyPage = await Content.findOne({page:page.trim()});

    if(allreadyPage){
        return res.status(404).json({success:false,message:"page Allready exist"}) 
    }
    
    
    await Content.create({page:page.trim(),des});

   return res.status(201).json({success:true,message:"Content Created"})


} catch (error) {
    next(error)
}
}


export const getData = async (req:Request,res:Response,next:NextFunction)=>{
    try {
        const {page} =req.params
        
        const getPage = await Content.findOne({page});
        
        if(!getPage){
            return res.status(404).json({success:false,message:"Page Not Found"})
        }


        return res.status(200).json({success:true,page:getPage})


    } catch (error) {
        next(error)
    }
}

export const UpdateContent =  async (req:Request,res:Response,next:NextFunction)=>{
    try {
        const pageId = req.params.id;
        const content = await Content.findById(pageId);
    if(!content){
return res.status(404).json({success:false,message:"Page not found"})
    }
const {info} = req.body
content.des = info;

await content.save();

return res.status(200).json({success:true,message:"Content Updated"})


    } catch (error) {
        next(error)
    }
}

export const DeleteContent = async (req:Request,res:Response,next:NextFunction)=>{
    try {
   const contentId = req.params.id;
   
    await Content.findByIdAndDelete(contentId);

    return res.status(200).json({success:true,message:"Content delete"})
 


        
    } catch (error) {
        next(error)
    }
}
   
