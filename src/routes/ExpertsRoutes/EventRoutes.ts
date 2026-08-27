import express from "express"
import { VerifyExpert } from "../../middlewere/verifyExpert";
import { createEvent, DeleteEvent, editEvent, getEvent, getSingleEvent } from "../../controller/experts/eventController";
import { eventUpload } from "../../helper/UploadEvents";

const routes  = express.Router();


routes.post("/create",VerifyExpert,eventUpload.single("image"),createEvent as any)
routes.get("/get",VerifyExpert,getEvent as any)
routes.get("/get/:id",VerifyExpert,getSingleEvent as any)
routes.put("/update/:id",VerifyExpert,eventUpload.single("image"),editEvent as any)

routes.delete("/delete/:id",VerifyExpert,DeleteEvent as any)







export default routes