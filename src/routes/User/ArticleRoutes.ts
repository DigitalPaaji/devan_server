import express from "express"
import { getArticles, getHomeArticle, getHomeYT, getSingleArticles, getYtvideos } from "../../controller/user/LearningController";

const route  = express.Router();

route.get("/article/homepage",getHomeArticle)

route.get("/article/all",getArticles)
route.get("/article/get/:slug",getSingleArticles)




route.get("/yt/homepage",getHomeYT)
route.get("/yt/all",getYtvideos)

export default route