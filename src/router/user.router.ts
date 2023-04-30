import express from "express";

import userController from "../api/controllers/user.controller";

const router = express.Router();

router.post("/getconver", userController.getConver);

router.post("/update", userController.update);

router.post("/like", userController.like);

router.post("/chat", userController.chat);

router.post("/register", userController.register);

router.post("/discorver", userController.getDiscorverUser);

router.post("/login", userController.login);

router.post("/getmatch", userController.getmatch);

router.post("/getUser", userController.getUser);
export = router;
