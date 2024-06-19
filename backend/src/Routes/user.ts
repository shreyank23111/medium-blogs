import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from "hono/jwt";
import { signinInput, signupInput } from "@shreyank23/medium-common";


const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>();

userRouter.post("/signup", async(c)=> {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
}).$extends(withAccelerate())

const body = await c.req.json();
const { success } = signinInput.safeParse(body);

if(!success){
  c.status(411)
  return c.json({error: "Invalid data"})
}


try{
 const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.username,
      password: body.password
    }
  })
  console.log(user);
  
  
  const token: string = await sign({id: user.id}, c.env.JWT_SECRET);

  console.log(token);
  
  
    return c.json({
      token: token
    })
} 
catch(e) {
  c.status(403);
  console.log(e);
  return c.json({ error: "error while signing up" });
  
  
}

})

userRouter.post("/login", async(c)=> {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const { success } = signinInput.safeParse(body);

  if(!success){
    c.status(411)
    return c.json({error: "Invalid data"})
  }
  const user = await prisma.user.findUnique({
    where: {
      email: body.username
    }
  });

  if(!user){
    c.status(403);
    return c.json({
      error: "User not found"
    })
  }
  const token: string = await sign({id: user.id}, c.env.JWT_SECRET);
  return c.json({token: token});
})

export { userRouter };

