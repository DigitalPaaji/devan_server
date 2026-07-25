import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/database";
import bcrypt from "bcryptjs"
import JWT from "jsonwebtoken"

export const loginExpert = async(req:Request,res:Response,next:NextFunction)=>{
try {
    const {email,password}= req.body;
    
    
    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }


  const expert = await prisma.expert.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });



   if (!expert) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!expert.status) {
      return res.status(403).json({
        success: false,
        message: "Your expert account is inactive",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      expert.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

  
 const secret = process.env.JWT_SECRET!;
 const token = JWT.sign(
      {
        role: "expert",
      },
      secret,
      {
        subject: String(expert.id),
        expiresIn: "7d",
        issuer: "devan-api",
        audience: "devan-expert",
      }
    );



const isProduction = process.env.NODE_ENV === "production";
    res.cookie("expert",token, {
     httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
}) 







  return res.status(200).json({
      success: true,
      message: "Expert logged in successfully",
      expert:expert,
    });


} catch (error) {
    next(error)
}
}



