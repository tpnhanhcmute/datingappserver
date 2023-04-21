import express from "express";

import userController from "../api/controllers/user.controller";

const router = express.Router();

router.post("/create", userController.create);

router.patch("/update", userController.update);

router.post("/users", userController.create);

router.post("/register", userController.register);

router.post("/discorver", userController.getDiscorverUser);

router.post("/login", userController.login);

router.post("/getmatch", userController.getmatch);
// router.post("/match",controller.match);

export = router;
