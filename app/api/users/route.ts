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
        { status: 401 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: userId,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({
      users,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        msg: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
