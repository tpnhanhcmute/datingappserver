import express from "express";

import userController from "../api/controllers/user.controller";

const router = express.Router();

// router.get("/getall", userController.getAllUser);

router.post("/update", userController.update);

router.post("/like", userController.like);

router.post("/chat", userController.chat);

router.post("/register", userController.register);

router.post("/discorver", userController.getDiscorverUser);

router.post("/login", userController.login);

router.post("/getmatch", userController.getmatch);
export = router;
