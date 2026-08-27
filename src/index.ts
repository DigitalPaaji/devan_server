import "dotenv/config";
import express from "express";
import type { Request, Response }  from "express";
import cookieParser from "cookie-parser"

import { SubAdminIndex } from "./subAdminindex";
import errorHandler from "./helper/errorHandler";
import { connectRedis } from "./helper/redisServer";
import cors from "cors"
import path from "path"
import { ExpertsIndex } from "./ExpertsIndex";
import mongoose from "mongoose";
import { UserIndex } from "./UserIndex";
const app = express()
app.use(cors({
    origin: process.env.FRONTEND_URL!.split(","),
    credentials: true,               
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],

  })) 
  app.use(cookieParser())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use( 
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"),
 {
    maxAge: "7d",              
    etag: true,               
    lastModified: true,        
    immutable: true            
  })
);

app.get("/ping",async(req:Request,res:Response)=>{
return res.status(200).send("Pong")
})

SubAdminIndex(app)
ExpertsIndex(app)
UserIndex(app)


app.use(errorHandler)





const PORT = process.env.PORT || 8001;



mongoose.connect(process.env.DATABASE_URL!).then(async()=>{
  try {
    await connectRedis()
        app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
        console.error("Server startup failed:", error);
    process.exit(1);
  }
})

