import { Application } from "express"
import SuperAdminRoutes from "./routes/SuperAdmin/AuthRoutes"
import SuperAdminUserRoutes from "./routes/SuperAdmin/UserRoutes"
import SuperAdminExpertRoutes from "./routes/SuperAdmin/ExpertsRoutes"
import SuperAdminQuestionRoutes from "./routes/SuperAdmin/QuestionRoutes"
import EventsRoutes from "./routes/SuperAdmin/EventsRoutes"
import NewsRoutes from "./routes/SuperAdmin/NewsRoutes"
import jobsRoutes from "./routes/SuperAdmin/jobsRoutes"
import ArticleRoutes from "./routes/SuperAdmin/ArticleRoutes"

export const SubAdminIndex= (app : Application) : void => {

app.use("/api/v1/superadmin/auth",SuperAdminRoutes)
app.use("/api/v1/superadmin/user",SuperAdminUserRoutes)
app.use("/api/v1/superadmin/experts",SuperAdminExpertRoutes)
app.use("/api/v1/superadmin/questions",SuperAdminQuestionRoutes)
app.use("/api/v1/superadmin/events",EventsRoutes)
app.use("/api/v1/superadmin/news",NewsRoutes)
app.use("/api/v1/superadmin/jobs",jobsRoutes)
app.use("/api/v1/superadmin/learning",ArticleRoutes)





}