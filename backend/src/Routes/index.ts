import { Hono } from "hono";
import {userRouter} from "./user";
import {blogRouter} from "./blog";

const mainRouter = new Hono();

mainRouter.route("/user", userRouter);
mainRouter.route("/blog", blogRouter);

export {mainRouter};