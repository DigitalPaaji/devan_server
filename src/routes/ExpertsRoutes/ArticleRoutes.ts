import express from "express"
import { CreateDes, CreatreArticles, deleteArticleDes, getSingleArticle, GetArticleDes, getmyArticles, UpdateArticleDes, UpdateArticle, deleteArticle } from "../../controller/experts/ArticleController";
import { VerifyExpert } from "../../middlewere/verifyExpert";
import { articleUpload } from "../../helper/UploadArticle";
const routes  = express.Router();

routes.post("/create",VerifyExpert,articleUpload.single("image"),CreatreArticles as any)
routes.post("/des/add",VerifyExpert,articleUpload.single("image"),CreateDes as any)
routes.get("/get-all",VerifyExpert,getmyArticles as any)
routes.get("/get-content/:articleid",VerifyExpert,GetArticleDes as any)
routes.get("/get-article/:articleid",VerifyExpert,getSingleArticle as any)

routes.delete("/des/delete/:articleid/:desid",VerifyExpert,deleteArticleDes as any)
routes.delete("/delete/:articleid",VerifyExpert,deleteArticle as any)
routes.put("/des/update/:desid",VerifyExpert,articleUpload.single("image"),UpdateArticleDes as any)
routes.put("/update-article/:articleid",VerifyExpert,articleUpload.single("thumbnail"),UpdateArticle as any)


export default routes

