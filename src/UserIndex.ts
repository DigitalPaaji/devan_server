import { Application } from "express"
import AuthRoutes from "./routes/User/AuthRoutes"
import WeeklyQuestionRoutes from "./routes/User/WeeklyQuestionRoutes"
import eventRoutes from "./routes/User/eventRoutes"
import newsRoutes from "./routes/User/newsRoutes"
import JobRoutes from "./routes/User/JobRoutes"
import ArticleRoutes from "./routes/User/ArticleRoutes"

export const UserIndex= (app : Application) : void => {


    app.use("/api/v1/user/auth",AuthRoutes)
    app.use("/api/v1/user/weeklyquestion",WeeklyQuestionRoutes)
    app.use("/api/v1/user/events",eventRoutes)
    app.use("/api/v1/user/news",newsRoutes)
    app.use("/api/v1/user/jobs",JobRoutes)
    app.use("/api/v1/user/learning",ArticleRoutes)

}