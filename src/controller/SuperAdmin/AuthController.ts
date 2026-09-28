import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs"
import JWT from "jsonwebtoken"
import { sendOtpMail } from "../../helper/sendOtpMail";
import redisClient from "../../helper/redisServer";
import SuperAdmin from "../../model/superAdminModel";
import { Event } from "../../model/expertEventModel";
import JobPosting from "../../model/ExpertjobPostingSchema";
import User from "../../model/userModel";
import WeeklyChallenge from "../../model/ExpertQuestionModel";
import Expert from "../../model/expertModel";
import ChallengeAnswer from "../../model/ChallengeAnswerSchema";
import ExpertArticle from "../../model/experArticalModel";
import { ExpertEducation } from "../../model/expertEducation";
import { Champion } from "../../model/champianModel";


export const createSuperAdmin = async(req:Request,res:Response,next:NextFunction)=>{
    try {
       const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
      return;
    }

    if (name.length < 2 || name.length > 100) {
      res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters",
      });
      return;
    }

 const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
      return;
    }

    if (password.length < 6 || password.length > 25) {
      res.status(400).json({
        success: false,
        message: "Password must be between 6 and 25 characters",
      });
      return;
    }

const existingSuperAdmin = await SuperAdmin.findOne({email})
 if (existingSuperAdmin) {
      res.status(409).json({
        success: false,
        message: "Email already exists",
      });
      return;
    }

    const hashpass = await bcrypt.hash(password,10)

  const superAdmin = await SuperAdmin.create({ name,email,password:hashpass});
    res.status(201).json({
      success: true,
      message: "Super Admin created successfully",
      superAdmin,
    });
    } catch (error) {
        next(error)
    }
}

export const loginSuperAdmin = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {email,password}=  req.body;
        if (!email || !password) { throw new Error("Email and password are required"); }
        const superAdmin = await SuperAdmin.findOne({email});
       

   if(!superAdmin){
   throw new Error("Invalid email or password")
  }

   const compairPassword = await bcrypt.compare(password,superAdmin.password)

   if(!compairPassword){
    throw new Error("Invalid email or password" );
   }


   const JWT_ISSUER = "devan-api";
const JWT_AUDIENCE = "devan-super-admin";
 const secret = process.env.JWT_SECRET!;
  const token = JWT.sign({},secret,{
subject: String(superAdmin._id),
      expiresIn: "7d",
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
  })


    const otp = Math.floor(100000 + Math.random() * 900000).toString();


     await sendOtpMail(email, otp);

     await redisClient.set(`token:otp:${token}`, otp, {
      EX: 5 * 60,
      });


 return  res.status(200).json({success:true,message:"login success",token})


    } catch (error) {
        next(error)
    }
}

export const verifyOtp = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {token,otp} = req.body
      if (!token || !otp) {
      throw new Error("Token and OTP are required");
    }  
     if (!/^\d{6}$/.test(otp)) {
      throw new Error("OTP must contain 6 digits");
    }
const getOtp = await redisClient.get(`token:otp:${token}`)
if(!getOtp){
      throw new Error(
        "OTP has expired or has already been used"
      );
}

if(getOtp != otp){
throw new Error("Invalid OTP");

}


const isProduction = process.env.NODE_ENV === "production";
res.cookie("super_admin",token, {
     httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
})
await redisClient.del(`token:otp:${token}`);
 res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      
    });
    } catch (error) {
        next(error)
    }
}

interface ISuperAuth extends Request{
  superAdmin: any
}
export const getSuperAdmin= async(req:ISuperAuth,res:Response,next:NextFunction)=>{
  try {
    const superAdmin = req.superAdmin
    return res.status(200).json({superAdmin,success:true})
  } catch (error) {
    next(error)
  }
}




const getLastMonths = (numberOfMonths = 6) => {
  const months: {
    key: string;
    label: string;
    start: Date;
    end: Date;
  }[] = [];

  const now = new Date();

  for (let i = numberOfMonths - 1; i >= 0; i--) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    );

    const start = new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    );

    const end = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      1
    );

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    const label = date.toLocaleString("en-IN", {
      month: "short",
    });

    months.push({
      key,
      label,
      start,
      end,
    });
  }

  return months;
};


/**
 * Convert aggregation result into chart data
 */
const createMonthChart = (
  months: {
    key: string;
    label: string;
    start: Date;
    end: Date;
  }[],
  data: any[],
  field = "count"
) => {
  const map = new Map<string, number>();

  data.forEach((item) => {
    if (item?._id) {
      map.set(item._id, item[field] || 0);
    }
  });

  return months.map((month) => ({
    month: month.label,
    key: month.key,
    value: map.get(month.key) || 0,
  }));
};


/* =========================================================
   DASHBOARD
========================================================= */

export const getDashBoardData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    /* -----------------------------------------------------
       MONTH RANGE
    ----------------------------------------------------- */

    const months = getLastMonths(6);

    const firstMonth = months[0].start;


    /* =====================================================
       1. OVERVIEW COUNTS
    ===================================================== */

    const [
      totalUsers,
      activeUsers,

      totalExperts,
      activeExperts,

      totalArticles,
      publishedArticles,
      draftArticles,
      rejectedArticles,

      totalEducation,
      publishedEducation,

      totalJobs,
      publishedJobs,
      draftJobs,
      closedJobs,

      totalEvents,
      publishedEvents,

      totalChallenges,
      activeChallenges,
      completedChallenges,

      totalAnswers,

      totalChampions,
      weekChampions,
      monthChampions,
      yearChampions,
      hallOfFame,

      totalApplications,
    ] = await Promise.all([

      /* USERS */
      User.countDocuments({}),
      User.countDocuments({ status: true }),

      /* EXPERTS */
      Expert.countDocuments({}),
      Expert.countDocuments({ status: true }),

      /* ARTICLES */
      ExpertArticle.countDocuments({}),
      ExpertArticle.countDocuments({
        status: "PUBLISHED",
      }),
      ExpertArticle.countDocuments({
        status: "DRAFT",
      }),
      ExpertArticle.countDocuments({
        status: "REJECTED",
      }),

      /* EDUCATION */
      ExpertEducation.countDocuments({}),
      ExpertEducation.countDocuments({
        status: "PUBLISHED",
      }),

      /* JOBS */
      JobPosting.countDocuments({}),
      JobPosting.countDocuments({
        status: "PUBLISHED",
      }),
      JobPosting.countDocuments({
        status: "DRAFT",
      }),
      JobPosting.countDocuments({
        status: "CLOSED",
      }),

      /* EVENTS */
      Event.countDocuments({}),
      Event.countDocuments({
        status: "PUBLISHED",
      }),

      /* CHALLENGES */
      WeeklyChallenge.countDocuments({}),
      WeeklyChallenge.countDocuments({
        status: "ACTIVE",
      }),
      WeeklyChallenge.countDocuments({
        status: "COMPLETED",
      }),

      /* ANSWERS */
      ChallengeAnswer.countDocuments({}),

      /* CHAMPIONS */
      Champion.countDocuments({}),
      Champion.countDocuments({
        type: "WEEK",
      }),
      Champion.countDocuments({
        type: "MONTH",
      }),
      Champion.countDocuments({
        type: "YEAR",
      }),
      Champion.countDocuments({
        type: "hall_of_fame",
      }),

      /* APPLICATIONS */
      JobPosting.aggregate([
        {
          $project: {
            count: {
              $size: {
                $ifNull: ["$applydUser", []],
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$count",
            },
          },
        },
      ]),
    ]);


    /* =====================================================
       2. MONTHLY USERS
    ===================================================== */

    const monthlyUsers = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: firstMonth,
          },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt",
            },
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);


    /* =====================================================
       3. MONTHLY ARTICLES
    ===================================================== */

    const monthlyArticles = await ExpertArticle.aggregate([
      {
        $match: {
          createdAt: {
            $gte: firstMonth,
          },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt",
            },
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);


    /* =====================================================
       4. MONTHLY EDUCATION / VIDEOS
    ===================================================== */

    const monthlyEducation =
      await ExpertEducation.aggregate([
        {
          $match: {
            createdAt: {
              $gte: firstMonth,
            },
          },
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt",
              },
            },

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ]);


    /* =====================================================
       5. MONTHLY JOBS
    ===================================================== */

    const monthlyJobs = await JobPosting.aggregate([
      {
        $match: {
          createdAt: {
            $gte: firstMonth,
          },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt",
            },
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);


    /* =====================================================
       6. MONTHLY EVENTS
    ===================================================== */

    const monthlyEvents = await Event.aggregate([
      {
        $match: {
          createdAt: {
            $gte: firstMonth,
          },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt",
            },
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);


    /* =====================================================
       7. MONTHLY CHALLENGES
    ===================================================== */

    const monthlyChallenges =
      await WeeklyChallenge.aggregate([
        {
          $match: {
            createdAt: {
              $gte: firstMonth,
            },
          },
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt",
              },
            },

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ]);


    /* =====================================================
       8. MONTHLY CHALLENGE ANSWERS
    ===================================================== */

    const monthlyAnswers =
      await ChallengeAnswer.aggregate([
        {
          $match: {
            createdAt: {
              $gte: firstMonth,
            },
          },
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt",
              },
            },

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ]);


    /* =====================================================
       9. MONTHLY JOB APPLICATIONS
    ===================================================== */

    const monthlyApplications =
      await JobPosting.aggregate([
        {
          $unwind: {
            path: "$applydUser",
            preserveNullAndEmptyArrays: false,
          },
        },

        {
          $match: {
            "applydUser._id": {
              $exists: true,
            },
          },
        },

        {
          $match: {
            "applydUser": {
              $exists: true,
            },
          },
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$updatedAt",
              },
            },

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ]);


    /* =====================================================
       10. ARTICLE STATUS CHART
    ===================================================== */

    const articleStatusChart = [
      {
        name: "Published",
        value: publishedArticles,
      },
      {
        name: "Draft",
        value: draftArticles,
      },
      {
        name: "Rejected",
        value: rejectedArticles,
      },
    ];


    /* =====================================================
       11. JOB STATUS CHART
    ===================================================== */

    const jobStatusChart = [
      {
        name: "Published",
        value: publishedJobs,
      },
      {
        name: "Draft",
        value: draftJobs,
      },
      {
        name: "Closed",
        value: closedJobs,
      },
    ];


    /* =====================================================
       12. CONTENT DISTRIBUTION
    ===================================================== */

    const contentDistribution = [
      {
        name: "Articles",
        value: totalArticles,
      },
      {
        name: "Education",
        value: totalEducation,
      },
      {
        name: "Jobs",
        value: totalJobs,
      },
      {
        name: "Events",
        value: totalEvents,
      },
      {
        name: "Challenges",
        value: totalChallenges,
      },
    ];


    /* =====================================================
       13. MONTHLY CONTENT CHART
    ===================================================== */

    const monthlyContent = months.map((month) => {
      const getValue = (data: any[]) => {
        const found = data.find(
          (item) => item._id === month.key
        );

        return found?.count || 0;
      };

      return {
        month: month.label,
        key: month.key,

        users: getValue(monthlyUsers),

        articles: getValue(monthlyArticles),

        education: getValue(monthlyEducation),

        jobs: getValue(monthlyJobs),

        events: getValue(monthlyEvents),

        challenges: getValue(monthlyChallenges),

        answers: getValue(monthlyAnswers),

        applications: getValue(monthlyApplications),
      };
    });


    /* =====================================================
       14. RECENT CHAMPIONS
    ===================================================== */

    const recentChampions = await Champion.find({
      isActive: true,
    })
      .populate({
        path: "userId",
        select: "fullname email image",
      })
      .sort({
        createdAt: -1,
      })
      .limit(10)
      .lean();


    /* =====================================================
       15. RECENT ARTICLES
    ===================================================== */

    const recentArticles = await ExpertArticle.find({})
      .select(
        "title slug thumbnail status views category createdAt"
      )
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();


    /* =====================================================
       16. RECENT JOBS
    ===================================================== */

    const recentJobs = await JobPosting.find({})
      .select(
        "title slug category status location applicationsCount createdAt"
      )
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();


    /* =====================================================
       17. FINAL RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,

      overview: {
        users: {
          total: totalUsers,
          active: activeUsers,
        },

        experts: {
          total: totalExperts,
          active: activeExperts,
        },

        articles: {
          total: totalArticles,
          published: publishedArticles,
          draft: draftArticles,
          rejected: rejectedArticles,
        },

        education: {
          total: totalEducation,
          published: publishedEducation,
        },

        jobs: {
          total: totalJobs,
          published: publishedJobs,
          draft: draftJobs,
          closed: closedJobs,
        },

        events: {
          total: totalEvents,
          published: publishedEvents,
        },

        challenges: {
          total: totalChallenges,
          active: activeChallenges,
          completed: completedChallenges,
        },

        challengeAnswers: {
          total: totalAnswers,
        },

        applications: {
          total: totalApplications?.[0]?.total || 0,
        },

        champions: {
          total: totalChampions,
          week: weekChampions,
          month: monthChampions,
          year: yearChampions,
          hallOfFame,
        },
      },


      /* ===================================================
         CHART DATA
      =================================================== */

      charts: {

        /* Line chart */
        monthlyContent,

        /* Pie / Doughnut */
        articleStatus: articleStatusChart,

        jobStatus: jobStatusChart,

        contentDistribution,

        /* Individual charts */
        users: createMonthChart(
          months,
          monthlyUsers
        ),

        articles: createMonthChart(
          months,
          monthlyArticles
        ),

        education: createMonthChart(
          months,
          monthlyEducation
        ),

        jobs: createMonthChart(
          months,
          monthlyJobs
        ),

        events: createMonthChart(
          months,
          monthlyEvents
        ),

        challenges: createMonthChart(
          months,
          monthlyChallenges
        ),

        answers: createMonthChart(
          months,
          monthlyAnswers
        ),

        applications: createMonthChart(
          months,
          monthlyApplications
        ),
      },


      /* ===================================================
         RECENT DATA
      =================================================== */

      recent: {
        champions: recentChampions,
        articles: recentArticles,
        jobs: recentJobs,
      },
    });

  } catch (error) {
    console.error(
      "Dashboard Error:",
      error
    );

    next(error);
  }
};






