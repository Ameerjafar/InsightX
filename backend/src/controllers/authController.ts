import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import z from 'zod'
const objectSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

const prisma = new PrismaClient();

export const signup = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const schemaCheck = objectSchema.safeParse({email, password});
 
  try {
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if(!schemaCheck.success) return res.status(404).json({message: "You are not met the constraits"}); 
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    const balance  = await prisma.balance.create({
        data: {
            userId: user!.id,
            freeMargin: 5000,
            lockedMargin: 0,
            USD: 5000
        }
    })
    console.log("This is your current balance in your bank account", balance);

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const schemaCheck = objectSchema.safeParse({email, password});

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    console.log(schemaCheck)
    if(!schemaCheck.success) return res.status(404).json({message: "You are not met the constraits"}); 

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user!.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({userId: user.id, email}, process.env.JWT_SECRET!, {expiresIn: 7})

    // const individualAsset = await prisma.individualAsset.create({
    //     data: {
    //         BalanceId: balance.id!,

    //     }
    // })
    // console.log("This is your current balance in your bank account", balance);
    // localStorage.setItem("email", email);
    return res.status(200).json({ message: "Login successful", token, userId: user.id });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
