import express from "express"
import { getHomepageNews, getNews, getSingleNews } from "../../controller/user/newsController";

const route  = express.Router();

route.get("/homepage",getHomepageNews)
route.get("/all",getNews)
route.get("/get/:slug",getSingleNews)

export default route