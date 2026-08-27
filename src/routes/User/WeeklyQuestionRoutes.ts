import express from "express"

const route  = express.Router();
import { VerifyUser } from "../../middlewere/userVerify";
import { getWeeklyQuestionAll, getWeeklyQuestionUser, submitAnswer } from "../../controller/user/weeklyQuestion";

route.get("/get-user",VerifyUser,getWeeklyQuestionUser as any)
route.get("/get-all",getWeeklyQuestionAll as any)
route.post("/submit-answer",VerifyUser,submitAnswer as any)



export default route