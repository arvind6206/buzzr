import { prisma } from "@/app/lib/db";
import { getUserId } from "@/app/lib/getUserId";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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

    await prisma.notification.updateMany({
      where: {
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      msg: "All notifications marked as read",
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
