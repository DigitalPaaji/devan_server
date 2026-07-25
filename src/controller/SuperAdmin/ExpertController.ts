import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/database";
import bcrypt from "bcryptjs";


export const createExpert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      fullname,
      email,
      password,
      phone,
      designation,
      qualification,
      specialization,
      expertise,
      experienceYears,
      organization,
      department,
      registrationNo,
      status,
      about,
      gender,
      dateOfBirth,
      address,
      city,
      state,
      linkedinUrl,
    } = req.body;

    /* Required-field validation */
    if (!fullname?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone?.trim() || null;

    /* Check unique email and phone */
    const existingExpert = await prisma.expert.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
        ],
      },
      select: {
        email: true,
        phone: true,
      },
    });

    if (existingExpert) {
      const message =
        existingExpert.email === normalizedEmail
          ? "An expert with this email already exists"
          : "An expert with this phone number already exists";

      return res.status(409).json({
        success: false,
        message,
      });
    }

    /* Parse expertise sent through FormData */
    let parsedExpertise: string[] = [];

    if (expertise) {
      try {
        const value =
          typeof expertise === "string"
            ? JSON.parse(expertise)
            : expertise;

        if (Array.isArray(value)) {
          parsedExpertise = value
            .map((item) => String(item).trim())
            .filter(Boolean);
        }
      } catch {
        parsedExpertise = String(expertise)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    const parsedExperienceYears =
      experienceYears !== undefined && experienceYears !== ""
        ? Number(experienceYears)
        : null;

    if (
      parsedExperienceYears !== null &&
      (!Number.isInteger(parsedExperienceYears) ||
        parsedExperienceYears < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Experience years must be a positive whole number",
      });
    }

    const parsedDateOfBirth = dateOfBirth
      ? new Date(dateOfBirth)
      : null;

    if (
      parsedDateOfBirth &&
      Number.isNaN(parsedDateOfBirth.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date of birth",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // This assumes multer stores the uploaded image locally.
    const image = req.file
      ? `/uploads/expert/${req.file.filename}`
      : null;

    const expert = await prisma.expert.create({
      data: {
        fullname: fullname.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: normalizedPhone,
        image,

        designation: designation?.trim() || null,
        qualification: qualification?.trim() || null,
        specialization: specialization?.trim() || null,
        expertise: parsedExpertise,
        experienceYears: parsedExperienceYears,
        organization: organization?.trim() || null,
        department: department?.trim() || null,
        registrationNo: registrationNo?.trim() || null,

        status:
          status === undefined
            ? true
            : status === true || status === "true",

        about: about?.trim() || null,
        gender: gender?.trim() || null,
        dateOfBirth: parsedDateOfBirth,
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        linkedinUrl: linkedinUrl?.trim() || null,
      },
      omit: {
        password: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Expert created successfully",
      expert,
    });
  } catch (error) {
    

    next(error);
  }
};

export const getAllExpert = async(req:Request,res:Response,next:NextFunction)=>{
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
      prisma.expert.findMany({
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

      prisma.expert.count({
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
