import { createSuperAdmin, getSuperAdmin, loginSuperAdmin, verifyOtp } from "../../controller/SuperAdmin/AuthController";
import express from "express"
import { VerifySuperAdmin } from "../../middlewere/verifySuperAdmin";
const routes = express.Router();



routes.post('/create',createSuperAdmin)
routes.post("/login",loginSuperAdmin)
routes.post("/verify",verifyOtp)
routes.get("/verify-admin",VerifySuperAdmin,getSuperAdmin as any)

export default routes


