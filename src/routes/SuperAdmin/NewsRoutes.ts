import express from "express"
import { VerifySuperAdmin } from "../../middlewere/verifySuperAdmin";
import { getNews, getNewsSingle, rejectNews, setHome } from "../../controller/SuperAdmin/NewsController";

const routes = express.Router();

routes.get("/all",VerifySuperAdmin,getNews)
routes.get("/get/:id",VerifySuperAdmin,getNewsSingle)
routes.put("/reject/:id",VerifySuperAdmin,rejectNews)
routes.put("/home-updated/:id",VerifySuperAdmin,setHome)


export default  routes;