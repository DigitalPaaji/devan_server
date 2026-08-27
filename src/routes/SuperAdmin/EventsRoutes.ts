

import express from "express"
import { VerifySuperAdmin } from "../../middlewere/verifySuperAdmin";
import { AddtohomePageEvent, cancelEvent, getEvents, GetSingleEvent, UpdateEvent } from "../../controller/SuperAdmin/EventsController";
const routes = express.Router();

routes.get("/all",VerifySuperAdmin,getEvents)
routes.get("/get/:id",VerifySuperAdmin,GetSingleEvent)
routes.put("/cancel/:id",VerifySuperAdmin,cancelEvent)
routes.put("/update/:id",VerifySuperAdmin,UpdateEvent)
routes.put("/hompage/:id",VerifySuperAdmin,AddtohomePageEvent)


export default  routes;