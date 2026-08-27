import { Application } from "express";
import ProfileRoutes from "./routes/ExpertsRoutes/Profile"
import ArticleRoutes from "./routes/ExpertsRoutes/ArticleRoutes"
import EducationRoutes from "./routes/ExpertsRoutes/EducationRoutes"
import JobPostingRoutes from "./routes/ExpertsRoutes/JobPostingRoutes"
import EventRoutes from "./routes/ExpertsRoutes/EventRoutes"
import NewsRoutes from "./routes/ExpertsRoutes/NewsRoute"
import weeklyChallengesRoutes from "./routes/ExpertsRoutes/weeklyChallengesRoutes"

export const ExpertsIndex= (app : Application) : void => {

app.use("/api/v1/experts/profile",ProfileRoutes)
app.use("/api/v1/experts/article",ArticleRoutes)
app.use("/api/v1/experts/education",EducationRoutes)
app.use("/api/v1/experts/job",JobPostingRoutes)
app.use("/api/v1/experts/event",EventRoutes)
app.use("/api/v1/experts/news",NewsRoutes)


app.use("/api/v1/experts/challenges",weeklyChallengesRoutes)





} 