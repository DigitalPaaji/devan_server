import express from "express"
import { createExpert, getAllExpert } from "../../controller/SuperAdmin/ExpertController";
import { VerifySuperAdmin } from "../../middlewere/verifySuperAdmin";
import { profileUpload } from "../../helper/UploadProfile";
const routes = express.Router();
 
routes.post("/create",VerifySuperAdmin,profileUpload.single("image"),createExpert)
routes.get("/all-experts",VerifySuperAdmin,getAllExpert)




export default routes;

