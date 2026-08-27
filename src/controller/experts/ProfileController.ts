import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs"
import JWT from "jsonwebtoken"
import Expert from "../../model/expertModel";
import { removeImage } from "../../helper/deleteImage";
import ExpertArticle from "../../model/experArticalModel";
import { News } from "../../model/expertNews";
import JobPosting from "../../model/ExpertjobPostingSchema";
import { Event } from "../../model/expertEventModel";
import mongoose from "mongoose";

export const loginExpert = async(req:Request,res:Response,next:NextFunction)=>{
try {
    const {email,password}= req.body;
    
    
    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }


  // const expert = await Expert.findOne({email:email});
  const expert = await Expert.find();



  //  if (!expert) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password pexpert",
        email,password,
        expert
      });
    // }

//     if (!expert.status) {
//       return res.status(403).json({
//         success: false,
//         message: "Your expert account is inactive ",
//       });
//     }

//     const isPasswordValid = await bcrypt.compare(
//       password,
//       expert.password
//     );

//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid email or password paswww",
//       });
//     }

  
//  const secret = process.env.JWT_SECRET!;
//  const token = JWT.sign(
//       {
//         role: "expert",
//       },
//       secret,
//       {
//         subject: String(expert._id),
//         expiresIn: "7d",
//         issuer: "devan-api",
//         audience: "devan-expert",
//       }
//     );



// const isProduction = process.env.NODE_ENV === "production";
//     res.cookie("expert",token, {
//      httpOnly: true,
//       secure: isProduction,
//       sameSite: isProduction ? "none" : "lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       path: "/",
// }) 







//   return res.status(200).json({
//       success: true,
//       message: "Expert logged in successfully",
//       expert:expert,
//     });


} catch (error) {
    next(error)
}
}



interface ISuperAuth extends Request{
  expert: any
}


export const getExpertVerify= async(req:ISuperAuth,res:Response,next:NextFunction)=>{
  try {
    const expert = req.expert
    return res.status(200).json({expert,success:true})
  } catch (error) {
    next(error)
  }
}


export const getProfile =async(req:ISuperAuth,res:Response,next:NextFunction)=>{
try {
  const expertId = req.expert?._id
  const expert = await Expert.findById(expertId);


  if(!expert){
    return res.status(404).json({
      success:false,messae:"Expert not found"
    })
  }

  return res.status(200).json({success:true,expert})



} catch (error) {
  next(error)
}

}

const DeletImg=async(thumbnailPath :string | null)=>{
   if(thumbnailPath){
          await removeImage(thumbnailPath)
        }
}


export const UpdateProfile=async(req:ISuperAuth,res:Response,next:NextFunction)=>{

  const image = req.file as Express.Multer.File || undefined;
 const imagePath = image
      ? `/uploads/profile/${image.filename}`
      : "";

  try {
 const expertId = req.expert?._id
  const expert = await Expert.findById(expertId);


  if(!expert){
    DeletImg(imagePath)
    return res.status(404).json({
      success:false,messae:"Expert not found"
    })
  }


  const {fullname,phone,designation,qualification,specialization,expertise,experienceYears,
    organization,department,about,gender,address,city,state,linkedinUrl,dateOfBirth
  } = req.body;

expert.fullname = fullname ? fullname : expert.fullname
// expert.email = email ? email : expert.email
expert.phone = phone 
expert.designation = designation ? designation : expert.designation
expert.qualification = qualification ? qualification : expert.qualification
expert.specialization = specialization ? specialization : expert.specialization
expert.expertise =JSON.parse(expertise)
expert.experienceYears = experienceYears
expert.organization = organization
expert.department = department
expert.about = about
expert.gender = gender ? gender.toLowerCase() : expert.gender
expert.address = address
expert.city = city
expert.state = state
expert.linkedinUrl = linkedinUrl
expert.dateOfBirth = dateOfBirth


if(imagePath){
  expert.image  && DeletImg(expert.image);

  expert.image=imagePath

}

expert.save()



return res.status(200).json({success:true,expert})



  } catch (error) {
        DeletImg(imagePath)
    next(error)
  }
} 

export const handleLogout = async(req:ISuperAuth,res:Response,next:NextFunction)=>{
  try {
    
       const isProduction = process.env.NODE_ENV === "production";
      res.clearCookie("expert", {
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





export const getDashboadData = async (
  req: ISuperAuth,
  res: Response,
  next: NextFunction
) => {
  try {
    const expertId = req.expert._id;

    const [articles,news,jobs,events,articleStats,jobStats,] = await Promise.all([
      ExpertArticle.countDocuments({ expertId }),

      News.countDocuments({ expertId }),

      JobPosting.countDocuments({ expertId }),

      Event.countDocuments({ expertId }),

      ExpertArticle.aggregate([
        {
          $match: {
            expertId: new mongoose.Types.ObjectId(expertId),
          },
        },
        {
          $group: {
            _id: null,
            totalViews: {
              $sum: "$views",
            },
          },
        },
      ]),

      JobPosting.aggregate([
        {
          $match: {
            expertId: new mongoose.Types.ObjectId(expertId),
          },
        },
        {
          $group: {
            _id: null,
            totalApplications: {
              $sum: "$applicationsCount",
            },
          },
        },
      ]),
    ]);

    // -----------------------------
    // MONTHLY ARTICLE DATA
    // -----------------------------

    const articleChart = await ExpertArticle.aggregate([
      {
        $match: {
          expertId: new mongoose.Types.ObjectId(expertId),
        },
      },

      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },

          articles: {
            $sum: 1,
          },

          views: {
            $sum: "$views",
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // -----------------------------
    // MONTHLY NEWS DATA
    // -----------------------------

    const newsChart = await News.aggregate([
      {
        $match: {
          expertId: new mongoose.Types.ObjectId(expertId),
        },
      },

      {
        $group: {
          _id: {
            year: { $year: "$publicationDate" },
            month: { $month: "$publicationDate" },
          },

          news: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // -----------------------------
    // MONTHLY JOB DATA
    // -----------------------------

    const jobChart = await JobPosting.aggregate([
      {
        $match: {
          expertId: new mongoose.Types.ObjectId(expertId),
        },
      },

      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },

          jobs: {
            $sum: 1,
          },

          applications: {
            $sum: "$applicationsCount",
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // -----------------------------
    // MONTHLY EVENT DATA
    // -----------------------------

    const eventChart = await Event.aggregate([
      {
        $match: {
          expertId: new mongoose.Types.ObjectId(expertId),
        },
      },

      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },

          events: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // -----------------------------
    // CREATE COMBINED CHART
    // -----------------------------

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const chartMap = new Map<string, any>();

    const addToChart = (
      data: any[],
      fields: string[]
    ) => {
      data.forEach((item) => {
        const year = item._id.year;
        const month = item._id.month;

        const key = `${year}-${month}`;

        if (!chartMap.has(key)) {
          chartMap.set(key, {
            year,
            month,
            monthName: monthNames[month - 1],

            articles: 0,
            news: 0,
            jobs: 0,
            events: 0,

            views: 0,
            applications: 0,
          });
        }

        const chartItem = chartMap.get(key);

        fields.forEach((field) => {
          chartItem[field] += item[field] || 0;
        });
      });
    };

    addToChart(articleChart, [
      "articles",
      "views",
    ]);

    addToChart(newsChart, [
      "news",
    ]);

    addToChart(jobChart, [
      "jobs",
      "applications",
    ]);

    addToChart(eventChart, [
      "events",
    ]);

    const chart = Array.from(chartMap.values()).sort(
      (a, b) => {
        if (a.year !== b.year) {
          return a.year - b.year;
        }

        return a.month - b.month;
      }
    );

    // -----------------------------
    // NEWS CATEGORY
    // -----------------------------

    const newsByCategory = await News.aggregate([
      {
        $match: {
          expertId: new mongoose.Types.ObjectId(expertId),
        },
      },

      {
        $group: {
          _id: "$category",

          count: {
            $sum: 1,
          },
        },
      },

      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]);

    // -----------------------------
    // RESPONSE
    // -----------------------------

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",

      data: {
        overview: {
          articles,
          news,
          jobs,
          events,

          articleViews:
            articleStats[0]?.totalViews || 0,

          jobApplications:
            jobStats[0]?.totalApplications || 0,
        },

        chart,

        newsByCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};


