import { Application } from "express";
import ProfileRoutes from "./routes/ExpertsRoutes/Profile"
import ArticleRoutes from "./routes/ExpertsRoutes/ArticleRoutes"

export const ExpertsIndex= (app : Application) : void => {

app.use("/api/v1/experts/profile",ProfileRoutes)
app.use("/api/v1/experts/article",ArticleRoutes)







} 