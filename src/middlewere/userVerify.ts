
import type { NextFunction, Request, Response } from "express";
import JWT, { JsonWebTokenError, JwtPayload, TokenExpiredError } from "jsonwebtoken";
import User from "../model/userModel";
const JWT_ISSUER = "devan-api";
const JWT_AUDIENCE = "devan-user";


export const VerifyUser = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const token = req.cookies?.user_token;
          if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing",
      });
    }

     const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

         
    const decoded = JWT.verify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as JwtPayload;



   if (!decoded.sub) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }
    const userId = decoded.sub;


const user = await User.findById(userId).select("fullname email image phone gender status lastLoginAt");


  if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found",
      });
    }

if(!user.status){
 return res.status(401).json({
        success: false,
        message: "User status not Active",
      });
}

   (req as any).user = user;
next();

    } catch (error) {
        if (error instanceof TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again",
      });
    }

    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    next(error); 
    }
}
