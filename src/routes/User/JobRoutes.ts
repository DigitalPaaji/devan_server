
import express from "express"
import { applyforJob, getHomepageJobs, getJobs, getSingleJob } from "../../controller/user/JobsController";
import { VerifyUser } from "../../middlewere/userVerify";

const route  = express.Router();

route.get("/homepage",getHomepageJobs)
route.get("/all",getJobs)
route.get("/get/:slug",getSingleJob)
route.put("/applyjob/:id",VerifyUser,applyforJob as any)

export default route
// 