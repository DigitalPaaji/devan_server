import express from "express"
import { VerifyExpert } from "../../middlewere/verifyExpert";
import { CreateJob, DeleteJob, getAllJob, GetApplyedjob, getJob, UpdateJob } from "../../controller/experts/JobPostingController";

const route  = express.Router();
 
route.post("/create",VerifyExpert,CreateJob as any)
route.get("/get",VerifyExpert,getAllJob as any)
route.get("/get/:jobId",VerifyExpert,getJob as any)
route.get("/posted/:jobId",VerifyExpert,GetApplyedjob as any)
route.put("/update/:jobId",VerifyExpert,UpdateJob as any)
route.delete("/delete/:jobId",VerifyExpert,DeleteJob  as any)



export default route