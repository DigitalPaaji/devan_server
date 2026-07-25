import express from "express";
import { loginExpert } from "../../controller/experts/ProfileController";
const routes = express.Router();

routes.post("/login",loginExpert)


export default routes