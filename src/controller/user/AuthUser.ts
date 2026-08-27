
import type { NextFunction, Request, Response } from "express"
import User from "../../model/userModel";
import bcrypt from "bcryptjs"
import JWT from "jsonwebtoken"
import { removeImage } from "../../helper/deleteImage";

 export const loginUser = async(req:Request,res:Response,next:NextFunction) =>{
    try {
         const {email,password}= req.body;
        if (!email?.trim() || !password) {
       return res.status(400).json({
         success: false,
         message: "Email and password are required",
       });
     }


    const user = await User.findOne({email:email.trim().toLowerCase()}).select("+password");

if(!user){
       return res.status(401).json({
         success: false,
         message: "Invalid email or password",
       });
}
     if (!user.status) {
       return res.status(403).json({
         success: false,
         message: " User account is inactive",
       });
     }
     const isPasswordValid = await bcrypt.compare(
       password,
       user.password
     );

     if (!isPasswordValid) {
       return res.status(401).json({
         success: false,
         message: "Invalid email or password",
       });
     }
user.lastLoginAt = new Date(Date.now());
await user.save()
const secret = process.env.JWT_SECRET!;
  const token = JWT.sign(
       {
         role: "user",
       },
       secret,
       {
         subject: String(user._id),
         expiresIn: "7d",
         issuer: "devan-api",
         audience: "devan-user",
       }
     );


 const isProduction = process.env.NODE_ENV === "production";
     res.cookie("user_token",token, {
      httpOnly: true,
       secure: isProduction,
       sameSite: isProduction ? "none" : "lax",
       maxAge: 7 * 24 * 60 * 60 * 1000,
       path: "/",
 }) 
   return res.status(200).json({
       success: true,
       message: "User logged in successfully",
       user:user,
     });

    } catch (error) {
        next(error)
    }
 }


interface IAuth extends Request{
  user: any
}


export const verifyuserDetail = async(req:IAuth,res:Response,next:NextFunction) =>{
    try {
const user = req.user;

return res.status(200).json({success:true,user})
        

    } catch (error) {
        next(error)
    }
}



 export const getUserDetails = async(req:IAuth,res:Response,next:NextFunction) =>{
    try {
        const userId = req.user._id;
        
        const user = await User.findById(userId);


return res.status(200).json({success:true,user})


    } catch (error) {
        next(error)
    }
 }


const DeletImg=async(thumbnailPath :string | null)=>{
   if(thumbnailPath){
          await removeImage(thumbnailPath)
        }
}

 export const updateDetails = async(req:IAuth,res:Response,next:NextFunction) =>{

const files = req.files as {
  [fieldname: string]: Express.Multer.File[];
};

const xImage = files?.image?.[0];
const yImage = files?.resume?.[0];

const ProfilePath = xImage
  ? `/uploads/user/${xImage.filename}`
  : null;

const ResumePath = yImage
  ? `/uploads/user/${yImage.filename}`
  : null;


    try {
         const userId = req.user._id;
const {fullname,phone,gender,dateOfBirth,address} = req.body

   if(!fullname || !phone  ){
    DeletImg(ProfilePath)
    DeletImg(ResumePath)
    return res.status(404).json({
        success:"false",
        message:"Fullname and phone Number required"
    })
   }

const numberAlready = await User.findOne({
  phone,
  _id: { $ne: userId },
});
if(numberAlready){
     DeletImg(ProfilePath)
    DeletImg(ResumePath)
 return res.status(404).json({success:false,message:"Mobile Number Allready exist"})    
}

const user = await User.findById(userId);
if(!user){
     DeletImg(ProfilePath)
    DeletImg(ResumePath)
    return res.status(404).json({success:false,message:"User Not found"})
}


user.fullname=fullname
user.phone=phone
user.gender=gender
user.dateOfBirth=dateOfBirth
user.address=address


if(ResumePath){
    user.resume && DeletImg(user.resume)
    user.resume= ResumePath
}

if(ProfilePath){
    user.image && DeletImg(user.image)
    user.image= ProfilePath
}

 await  user.save()


return res.status(200).json({success:true,message:"User Updated",user})


    } catch (error) {
         DeletImg(ProfilePath)
    DeletImg(ResumePath)
        next(error)
    }
 }


 export const LogoutUser= async(req:IAuth,res:Response,next:NextFunction) =>{
  try {
      const isProduction = process.env.NODE_ENV === "production";
      res.clearCookie("user_token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });
      return res.status(200).json({
      success: true,
      message: "Logout successfully",
    });
  } catch (error) {
 next(error)
  }
 }





 
 

