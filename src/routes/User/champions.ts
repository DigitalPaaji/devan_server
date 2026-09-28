import express from "express"
import {  getChampions } from "../../controller/user/Champion";
const route  = express.Router();



route.get("/getthreee",getChampions)





export default route

