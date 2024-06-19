import { Hono } from 'hono'
import {mainRouter} from "./Routes/index";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

const app = new Hono()


app.route("/api/v1", mainRouter);

export default app
