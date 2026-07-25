import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/database";
import { removeImage } from "../../helper/deleteImage";
import bcrypt from "bcryptjs"




export const createUser = async(req:Request,res:Response,next:NextFunction)=>{
      const uploadedImage = req.file as Express.Multer.File | undefined;

  const imagePath = uploadedImage
    ? `/uploads/profile/${uploadedImage.filename}`
    : null;

    try {
         const {fullname,email,phone,password,status,gender,dateOfBirth,address} = req.body


 if (!fullname?.trim() || !email?.trim() || !password) {
      if (imagePath) {
        await removeImage(imagePath);
      }

      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required",
      });
    }
const existingEmail = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
      select: {
        id: true,
      },
    });

 if (existingEmail) {
      if (imagePath) {
        await removeImage(imagePath);
      }

      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }



     if (phone?.trim()) {
      const existingPhone = await prisma.user.findUnique({
        where: {
          phone: phone.trim(),
        },
        select: {
          id: true,
        },
      });

      if (existingPhone) {
        if (imagePath) {
          await removeImage(imagePath);
        }

        return res.status(409).json({
          success: false,
          message: "User with this phone number already exists",
        });
      }
    }

 const hashedPassword = await bcrypt.hash(password, 12);
const user = await prisma.user.create({
      data: {
        fullname: fullname.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,

        phone: phone?.trim() || null,
        image: imagePath,
        gender: gender?.trim() || null,
        address: address?.trim() || null,

        status:
          status === undefined
            ? true
            : status === true || status === "true",

        dateOfBirth: dateOfBirth
          ? new Date(dateOfBirth)
          : null,
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        phone: true,
        image: true,
        status: true,
        gender: true,
        dateOfBirth: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  return res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });

    } catch (error) {
          if (imagePath) {
      try {
        await removeImage(imagePath);
      } catch (imageError) {
        console.error("Failed to remove uploaded image:", imageError);
      }
    }

 
   

    next(error);
    }
}

export const getAllUser = async(req:Request,res:Response,next:NextFunction)=>{
try {
      const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 15, 1),
      100
    );

     const skip = (page - 1) * limit;
 const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";
const where = search
      ? {
          OR: [
            {
              fullname: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              phone: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {};
 const [users, totalUsers] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        omit: {
          password: true,
        },
      }),

      prisma.user.count({
        where,
      }),
    ]);
 return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        limit,
      },
    });

    

} catch (error) {
    next(error)
}
}