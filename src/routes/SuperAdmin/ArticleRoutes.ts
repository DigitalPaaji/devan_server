import express from "express"
import { VerifySuperAdmin } from "../../middlewere/verifySuperAdmin";
import { getArticles, getSingleArticle, getYtVideos, RejectArticle, RejectYt, setHomePageYt, TogglHompage } from "../../controller/SuperAdmin/LearnigController";
const routes = express.Router();


routes.get("/article/all",VerifySuperAdmin,getArticles)
routes.get("/article/get/:id",VerifySuperAdmin,getSingleArticle)
routes.patch("/article/homepage/:id",VerifySuperAdmin,TogglHompage)
routes.patch("/article/status/:id",VerifySuperAdmin,RejectArticle)



///yt///

routes.get("/yt/all",VerifySuperAdmin,getYtVideos)
routes.patch("/yt/homepage/:id",VerifySuperAdmin,setHomePageYt)
routes.patch("/yt/status/:id",VerifySuperAdmin,RejectYt)



export default routes