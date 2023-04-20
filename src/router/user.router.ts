import express from "express";

import userController from "../api/controllers/user.controller";

const router = express.Router();

router.post("/create", userController.create);

router.patch("/edit", userController.editProfile);

router.post("/like", userController.like);

router.post("/chat", userController.sendMessage);

router.post("/register", userController.register);

router.post("/discorver", userController.getDiscorverUser);

router.post("/login", userController.login);
// router.post("/match",controller.match);

export = router;
