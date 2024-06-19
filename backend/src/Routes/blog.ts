import {Hono, Context, Next} from "hono";
import { verify } from "hono/jwt";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { createBlogInput, updateBlogInput } from "@shreyank23/medium-common";

const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  },
  Variables: {
    userId: string
  }
}>();

const authMiddleware = async(c: Context, next: Next) => {
  const header = c.req.header("authorization") || "";
  const token = header.split(" ")[1];

 try{
  const user = await verify(token, c.env.JWT_SECRET)
  if(user){
    c.set("userId", user.id)
    await next()
  } else{
    c.status(403)
    return c.json({error: "unauthorized"});
  } 
  } catch(e){
    c.status(403);
    return c.json({
      message: "You are not logged in"
    })
 }
}

blogRouter.use("/*", authMiddleware);

blogRouter.post("/create-blog", async(c)=> {
  const body = await c.req.json();
  const {success} = createBlogInput.safeParse(body);

  if(!success){
    c.status(411)
    return c.json({error: "Invalid data"});
  }

  const userId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
}).$extends(withAccelerate())
  
try{
  const blog = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: userId
    }
  })
  return c.json({
    id: blog.id
  })
} catch(e){
  c.status(411);
    return c.json({
      error: "Error while creating post"
    })
}
})

blogRouter.put("/update-blog", async(c)=> {
  const body = await c.req.json();
  const userId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
}).$extends(withAccelerate())
  
const blog = await prisma.post.update({
  where: {id: body.id},
  data: {
    title: body.title,
    content: body.content,
    authorId: userId
  }
})
return c.json({
  id: blog.id
})
})

blogRouter.get("/get-blog/:id", async(c)=> {
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
}).$extends(withAccelerate())

  try{
    const blog = await prisma.post.findFirst({
      where: {
        id: id
      }
    })
    return c.json({
      blog
    })
  } catch(e){
    c.status(411);
    return c.json({
      error: "Error while fatching post"
    })
  }
})

blogRouter.get("/bulk-post", async(c)=> {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
}).$extends(withAccelerate())

try{
  const blogs = await prisma.post.findMany();
  return c.json({blogs});

} catch(e) {
  c.status(411);
  return c.json({error: 'Error while fetching post'})
}
})

export { blogRouter };