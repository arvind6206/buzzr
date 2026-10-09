import { prisma } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest){
    try {
        const {email, password} = await req.json()
        if(!email || !password){
            return NextResponse.json({
                msg: "email and password is required"
            }, {status: 400})
        }

        const findUser = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if(!findUser){
            return NextResponse.json({
                msg: "User does not exist"
            }, {status: 400})
        }

        const matched = await bcrypt.compare(password, findUser.password)
        if(!matched){
            return NextResponse.json({
                msg: "Incorrect Password"
            }, {status: 400})
        }
        const jwtSecret = process.env.JWT_SECRET!;

        const token = jwt.sign({
            id: findUser.id
        }, jwtSecret)

        return NextResponse.json({
            msg: "USer logged in successfully",
            token
        }, {status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            msg: "Intrenal Server Error"
        }, {status: 500})
    }
}