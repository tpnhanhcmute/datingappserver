import express from "express";
import { sendEmail } from "./api/services/firebase.service";
import userRouter from "./router/user.router";
import locationRouter from "./router/location.router"
import { getLocation } from "./api/services/location.service";

const app = express();
app.use(express.json());

const port = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/users", userRouter);
app.use("/location", locationRouter);

app.get("/", (req, res) => {
  res.send("Hello Huy dep zai!");
});
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
