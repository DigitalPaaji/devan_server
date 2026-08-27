import express from "express";
import { getDashboadData, getExpertVerify, getProfile, handleLogout, loginExpert, UpdateProfile } from "../../controller/experts/ProfileController";
import { VerifyExpert } from "../../middlewere/verifyExpert";
import { profileUpload } from "../../helper/UploadProfile";

const routes = express.Router();

routes.post("/login",loginExpert)

routes.get("/verify-expert",VerifyExpert,getExpertVerify  as any)
routes.get("/get",VerifyExpert,getProfile  as any)
routes.put("/update",VerifyExpert,profileUpload.single("image"),UpdateProfile  as any)
routes.get("/logout",VerifyExpert,handleLogout as any)

routes.get("/dashboard",VerifyExpert,getDashboadData as any)



export default routes