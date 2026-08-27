import express from "express"
import { VerifyExpert } from "../../middlewere/verifyExpert";
import { eventNews } from "../../helper/UploadNews";
import { createNews, DeleteNews, editNews, getNews, getSingleNews } from "../../controller/experts/newsController";

const routes  = express.Router();


routes.post("/create",VerifyExpert,eventNews.single("image"),createNews as any)
routes.get("/get",VerifyExpert,getNews as any)
routes.get("/get/:id",VerifyExpert,getSingleNews as any)
routes.put("/update/:id",VerifyExpert,eventNews.single("image"),editNews as any)

routes.delete("/delete/:id",VerifyExpert,DeleteNews as any)







export default routes