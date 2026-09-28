
import type { NextFunction, Request, Response } from "express"
import User from "../../model/userModel";
import bcrypt from "bcryptjs"
import JWT from "jsonwebtoken"
import { removeImage } from "../../helper/deleteImage";
import { sendOtpMail } from "../../helper/sendOtpMail";
import redisClient from "../../helper/redisServer";
import mongoose from "mongoose";


export const SignupUser =async(req:Request,res:Response,next:NextFunction) =>{
  try {
const {fullname,email,phone,password,gender,dateOfBirth,address} = req.body
  
     if (!fullname?.trim() || !email?.trim() || !password) {
         
    
          return res.status(400).json({
            success: false,
            message: "Full name, email and password are required",
          });
        }
    const existingEmail = await User.findOne({
            email: email.trim().toLowerCase(),
        });
    
     if (existingEmail) {
         
          return res.status(409).json({
            success: false,
            message: "User with this email already exists",
          });
        }
      if (phone?.trim()) {
      const existingPhone = await User.findOne({phone: phone.trim()});

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "User with this phone number already exists",
        });
      }
    }




      const otp = Math.floor(100000 + Math.random() * 900000).toString();


     await sendOtpMail(email, otp);

     const storeData =JSON.stringify({fullname,email,phone,password,gender,dateOfBirth,address,otp })
     await redisClient.set(`devan-email:${email}`, storeData, {
      EX: 5 * 60,
      });



       return  res.status(200).json({success:true,message:"otp send "})














  } catch (error) {
    next(error)
  }
}




export const verifyOtpUser = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { useremail, userotp } = req.body;

    if (!useremail?.trim() || !userotp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    if (!/^\d{6}$/.test(String(userotp))) {
      return res.status(400).json({
        success: false,
        message: "OTP must contain 6 digits",
      });
    }

    const email = useremail.trim().toLowerCase();

    const getOtp = await redisClient.get(`devan-email:${email}`);

    if (!getOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired or has already been used",
      });
    }

    const {
      fullname,
      email: storedEmail,
      phone,
      password,
      gender,
      dateOfBirth,
      address,
      otp,
    } = JSON.parse(getOtp);

    if (String(otp) !== String(userotp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Delete OTP after successful verification
    await redisClient.del(`devan-email:${email}`);

    // Check again to prevent duplicate account creation
    const existingUser = await User.findOne({
      email: storedEmail.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashpass = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullname,
      email: storedEmail.toLowerCase(),
      phone,
      password: hashpass,
      gender:gender?gender:null,
      dateOfBirth,
      address,
    });

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

    res.cookie("user_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      
    });
  } catch (error) {
    next(error);
  }
};

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
 const userId = req.user._id;
        
        const user = await User.findById(userId);

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
user.gender=gender.toLowerCase()
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

 
 export const toggleArticles=  async(req:IAuth,res:Response,next:NextFunction) =>{
  try {
    const userId = req.user._id;
    const articleId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isSaved = user.savedArticles.some(
      (item: mongoose.Types.ObjectId) =>
        item.toString() === articleId.toString()
    );

    if (isSaved) {
      // Remove article
      user.savedArticles = user.savedArticles.filter(
        (item: mongoose.Types.ObjectId) =>
          item.toString() !== articleId.toString()
      );
    } else {
      
      user.savedArticles.push(
        new mongoose.Types.ObjectId(articleId.toString())
      );
    }

    await user.save();

    return res.status(200).json({
      success: true,
      saved: !isSaved,
      message: isSaved
        ? "Article removed from saved articles"
        : "Article saved successfully",
      savedArticles: user.savedArticles,
    });
} catch (error) {
  next(error)
}

 }



 export const getSaveArticle = async (
  req: IAuth,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate({
        path: "savedArticles",
        select:
          "expertId title slug shortDescription thumbnail category",
        populate: {
          path: "expertId",
          select: "fullname designation",
        },
      })
      .select("savedArticles");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Saved articles fetched successfully",
      articles: user.savedArticles,
    });
  } catch (error) {
    next(error);
  }
};



 
 

