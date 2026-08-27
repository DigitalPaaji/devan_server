import express from "express"
import { getUserDetails, loginUser, LogoutUser, updateDetails, verifyuserDetail } from "../../controller/user/AuthUser";
import { VerifyUser } from "../../middlewere/userVerify";
import { userProfileUpload } from "../../helper/UploadUserProfile";


const route  = express.Router();

route.post("/login",loginUser)

route.get("/verifyuser",VerifyUser,verifyuserDetail as any)
route.get("/userdetails",VerifyUser,getUserDetails as any)
route.get("/logout",VerifyUser,LogoutUser as any)



route.put("/update",VerifyUser,userProfileUpload.fields([
    {name:"image",maxCount:1},
    {name:"resume",maxCount:1},
]),updateDetails as any)





export default route