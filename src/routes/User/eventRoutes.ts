import express from "express"
import { getEvents, getHompageEvent, getSingleEvent } from "../../controller/user/eventController";
const route  = express.Router();


route.get("/homepage",getHompageEvent)
route.get("/all",getEvents)
route.get("/get/:slug",getSingleEvent)


export default route