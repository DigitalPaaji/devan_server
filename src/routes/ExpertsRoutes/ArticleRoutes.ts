import express from "express"
import { CreatreArticles } from "../../controller/experts/ArticleController";
import { VerifyExpert } from "../../middlewere/verifyExpert";
import { articleUpload } from "../../helper/UploadArticle";
const routes  = express.Router();

routes.post("/create",VerifyExpert,articleUpload.single("image"),CreatreArticles as any)




export default routes

