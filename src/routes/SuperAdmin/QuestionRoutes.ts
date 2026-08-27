import express from "express"
import { VerifySuperAdmin } from "../../middlewere/verifySuperAdmin";
import { getChallenges, selectQuestion, updateStatus } from "../../controller/SuperAdmin/ChallengesController";
import { creatChampion, getAllChampioUser } from "../../controller/SuperAdmin/ChampinaController";
import { certificatUpload } from "../../helper/Uploadcertificate";
const routes = express.Router();


routes.get("/get",VerifySuperAdmin,getChallenges)
routes.get("/get/champions/:champtype",VerifySuperAdmin,getAllChampioUser)
routes.put("/update/status",VerifySuperAdmin,updateStatus)
routes.put("/update/active-question",VerifySuperAdmin,selectQuestion)
routes.post("/create/champ",VerifySuperAdmin,certificatUpload.single("image"),creatChampion)





export default  routes;