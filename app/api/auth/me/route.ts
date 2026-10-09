import { prisma } from "@/app/lib/db";
import { getUserId } from "@/app/lib/getUserId";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        {
          msg: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const findUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if(!findUser){
        return NextResponse.json({
            msg: "User not found"
        }, {status: 404})
    }

    return NextResponse.json({
        msg: "user fetched successfully",
        findUser
    })
  } catch (error) {
    return NextResponse.json({
        msg: "Internal Server Error"
    }, {status: 500})
  }
}
