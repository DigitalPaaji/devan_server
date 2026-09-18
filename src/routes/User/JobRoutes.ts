
import express from "express"
import { applyforJob, getAppliedJob, getHomepageJobs, getJobs, getSingleJob } from "../../controller/user/JobsController";
import { VerifyUser } from "../../middlewere/userVerify";

const route  = express.Router();

route.get("/homepage",getHomepageJobs)
route.get("/all",getJobs)
route.get("/get/:slug",getSingleJob)
route.put("/applyjob/:id",VerifyUser,applyforJob as any)
route.get("/applyjob",VerifyUser,getAppliedJob as any)

export default route
// 