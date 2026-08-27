import express from "express"
import { VerifySuperAdmin } from "../../middlewere/verifySuperAdmin";
import { getJobs, getSingleJob, rejectJob, setHomeJob } from "../../controller/SuperAdmin/jobControllerAdmin";

const routes = express.Router();

routes.get("/all",VerifySuperAdmin,getJobs)
routes.get("/get/:id",VerifySuperAdmin,getSingleJob)
routes.put("/reject/:id",VerifySuperAdmin,rejectJob)
routes.put("/home-updated/:id",VerifySuperAdmin,setHomeJob)


export default routes