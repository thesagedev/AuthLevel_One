/**
 * Healthy check route
 *
 * This endpoint used by developers, monitoring tools
 * load balance and container orchestrators to verify
 * that the application is alive
 */

import { Router } from "express";
import mongoose from "mongoose";
import { APIResponse } from "../../core/index.js";

const healthRouter: Router = Router();

// GET: Returning application health
healthRouter.get("/", (req, res) => {
  // console.log(typeof req.user);
  return APIResponse.success(res, {
    message: "Server is healthy",
    data: {
      status: "Ok",
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      databaseState: mongoose.connection.readyState,
      database:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    },
  });
});

export default healthRouter;
