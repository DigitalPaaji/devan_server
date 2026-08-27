import express from "express";
import { VerifyExpert } from "../../middlewere/verifyExpert";
import { challengeUpload } from "../../helper/UploadChallenges";
import { AddbestAns, AnnounceResult, correctAnswer, createQuestion, dashActiveQuestion, DeleteQuestion, GetMyQuestion, getWeeklyQuestion } from "../../controller/experts/weeklyQuestionController";

const routes = express.Router();

routes.post("/create",VerifyExpert,challengeUpload.single("image"),createQuestion as any)
routes.get("/get",VerifyExpert,GetMyQuestion as any)
routes.delete("/delete/:id",VerifyExpert,DeleteQuestion as any)


routes.get("/get/:id",VerifyExpert,getWeeklyQuestion as any)
routes.patch("/best-answer/:id",VerifyExpert,AddbestAns as any)
routes.patch("/announce-result/:id",VerifyExpert,AnnounceResult as any)
routes.patch("/correct-answer/:id",VerifyExpert,correctAnswer as any)

routes.get("/myweeklyquestion",VerifyExpert,dashActiveQuestion as any)




export default routes
