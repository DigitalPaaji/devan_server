
import express from "express"
import { profileUpload } from "../../helper/UploadProfile";
import { createUser, getAllUser } from "../../controller/SuperAdmin/UserController";
import { VerifySuperAdmin } from "../../middlewere/verifySuperAdmin";
const routes = express.Router();

routes.post("/create",VerifySuperAdmin,profileUpload.single("image"),createUser)
routes.get("/all-users",VerifySuperAdmin,getAllUser)


export default  routes;