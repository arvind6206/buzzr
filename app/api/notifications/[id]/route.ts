import { prisma } from "@/app/lib/db";
import { getUserId } from "@/app/lib/getUserId";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const notificationId = params.id;

    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });

    if (!notification) {
      return NextResponse.json(
        {
          msg: "Notification not found",
        },
        { status: 404 }
      );
    }

    if (notification.receiverId !== userId) {
      return NextResponse.json(
        {
          msg: "Forbidden",
        },
        { status: 403 }
      );
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      msg: "Notification marked as read",
      notification: updatedNotification,
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
