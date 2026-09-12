/**
 *
 *
 */

import { Router } from "express";
import { UserController } from "../controllers/index.js";
import { authenticate } from "../../auth/middleware/auth.middleware.js";

const userRouter: Router = Router();

const userController = new UserController();

userRouter.get("/me", authenticate, userController.me);

export default userRouter;
