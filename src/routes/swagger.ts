import { Router } from "express";
import swaggerUI from "swagger-ui-express";
import { swaggerConfig } from "../config/swagger.config.js";

const router: Router = Router();

router.use("/", swaggerUI.serve);
router.get("/", swaggerUI.setup(swaggerConfig));

export default router;
