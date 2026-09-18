import express from "express"
const routes = express.Router();
import { VerifySuperAdmin } from "../../middlewere/verifySuperAdmin";
import { CreateContent, DeleteContent, getData, UpdateContent } from "../../controller/SuperAdmin/ContentController";


routes.post("/create",VerifySuperAdmin,CreateContent);
routes.get("/get/:page",VerifySuperAdmin,getData)
routes.put("/update/:id",VerifySuperAdmin,UpdateContent)
routes.delete("/delete/:id",VerifySuperAdmin,DeleteContent)
export default routes
