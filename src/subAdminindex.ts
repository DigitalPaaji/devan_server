import { Application } from "express"
import SuperAdminRoutes from "./routes/SuperAdmin/AuthRoutes"
import SuperAdminUserRoutes from "./routes/SuperAdmin/UserRoutes"
import SuperAdminExpertRoutes from "./routes/SuperAdmin/ExpertsRoutes"

export const SubAdminIndex= (app : Application) : void => {

app.use("/api/v1/superadmin/auth",SuperAdminRoutes)
app.use("/api/v1/superadmin/user",SuperAdminUserRoutes)
app.use("/api/v1/superadmin/experts",SuperAdminExpertRoutes)

}