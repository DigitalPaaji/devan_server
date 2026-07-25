
import type { NextFunction, Request, Response } from "express";
import JWT, { JsonWebTokenError, JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { prisma } from "../config/database";
const JWT_ISSUER = "devan-api";
const JWT_AUDIENCE = "devan-super-admin";


export const VerifySuperAdmin = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const token = req.cookies?.super_admin;
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
    const superAdminId = Number(decoded.sub);
if (!Number.isInteger(superAdminId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

const superAdmin = await prisma.superAdmin.findUnique({
      where: {
        id: superAdminId,
      },
      select: {
        id: true,
        email: true,
      },
    });

  if (!superAdmin) {
      return res.status(401).json({
        success: false,
        message: "Super admin account not found",
      });
    }
   (req as any).superAdmin = superAdmin;
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
