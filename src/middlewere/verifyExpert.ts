
import type { NextFunction, Request, Response } from "express";
import JWT, { JsonWebTokenError, JwtPayload, TokenExpiredError } from "jsonwebtoken";
import Expert from "../model/expertModel";
const JWT_ISSUER = "devan-api";
const JWT_AUDIENCE = "devan-expert";


export const VerifyExpert = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const token = req.cookies?.expert;
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
    const ExpertId = decoded.sub;


const expert = await Expert.findById(ExpertId).select("fullname email image phone gender status lastLoginAt");

  if (!expert) {
      return res.status(401).json({
        success: false,
        message: "Expert account not found",
      });
    }
   (req as any).expert = expert;
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
