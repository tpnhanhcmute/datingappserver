import express from "express";
import * as dotenv from "dotenv";
import { sendEmail } from "./api/services/firebase.service";
import userRouter from "./router/user.router";
import locationRouter from "./router/location.router";
import { getLocation } from "./api/services/location.service";
import imagesRouter from "./router/images.router";
import authenticationRouter from "./router/authentication.router"

dotenv.config();
const PORT: number = parseInt(process.env.PORT as string, 3000);
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/users", userRouter);
app.use("/location", locationRouter);
app.use("/images", imagesRouter);
app.use("",authenticationRouter)
app.get("/", (req,res)=>{
  res.status(200).send("Hello world");
} )
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
