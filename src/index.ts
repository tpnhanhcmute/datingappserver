import express from "express";
import * as dotenv from "dotenv";
import userRouter from "./router/user.router";
import locationRouter from "./router/location.router";
import imagesRouter from "./router/images.router";
import authenticationRouter from "./router/authentication.router"

dotenv.config();
let PORT = parseInt(process.env.PORT,10)

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/users", userRouter);
app.use("/location", locationRouter);
app.use("/images", imagesRouter);
app.use("",authenticationRouter)

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
