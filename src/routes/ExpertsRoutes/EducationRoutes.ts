import express from "express"
import { VerifyExpert } from "../../middlewere/verifyExpert";
import { createEducation, DeleteEduc, fetchEducation, UpdateEduc } from "../../controller/experts/EducationController";

const routes  = express.Router();

routes.post("/create",VerifyExpert,createEducation as any);
routes.get("/get",VerifyExpert,fetchEducation as any);
routes.delete("/delete/:eduid",VerifyExpert,DeleteEduc  as any)
routes.put("/edit/:eduid",VerifyExpert,UpdateEduc as any)


export default routes