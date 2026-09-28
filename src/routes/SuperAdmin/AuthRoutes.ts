import { createSuperAdmin, getDashBoardData, getSuperAdmin, loginSuperAdmin, verifyOtp } from "../../controller/SuperAdmin/AuthController";
import express from "express"
import { VerifySuperAdmin } from "../../middlewere/verifySuperAdmin";
const routes = express.Router();



routes.post('/create',createSuperAdmin)
routes.post("/login",loginSuperAdmin)
routes.post("/verify",verifyOtp)
routes.get("/verify-admin",VerifySuperAdmin,getSuperAdmin as any)
routes.get("/dashboard",VerifySuperAdmin,getDashBoardData as any)

export default routes


