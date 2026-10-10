import { prisma } from "@/app/lib/db";
import { getUserId } from "@/app/lib/getUserId";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const notificationSchema = z.object({
  receiverId: z.string().uuid(),
  type: z.enum([
    "FOLLOW",
    "LIKE",
    "COMMENT",
    "MESSAGE",
    "FRIEND_REQUEST",
    "SYSTEM",
  ]),
  message: z.string().trim().min(1).max(500),
});

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

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const notifications = await prisma.notification.findMany({
      where: {
        receiverId: userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      notifications,
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

export async function POST(req: NextRequest) {
  try {
    const senderId = await getUserId(req);
    if (!senderId) {
      return NextResponse.json(
        {
          msg: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const body = await req.json()
    const result = notificationSchema.safeParse(body)
    if(!result.success){
        return NextResponse.json({
            errors: result.error.flatten()
        }, {status: 400})
    }

    const {receiverId, type, message} = result.data

    const receiver = await prisma.user.findUnique({
        where: {
            id: receiverId,
            select: {
                id: true
            }
        }
    })

    if(!receiver){
        return NextResponse.json({
            msg: "Receiver not found"
        }, {status: 404})
    }

    const notification = await prisma.notification.create({
        data: {
            senderId,
            receiverId,
            type,
            message
        }
    })

    return NextResponse.json({
        msg: "Notification created successfully",
        notification
    }, {status: 201})
  } catch (error) {
    console.error(error)
    return NextResponse.json({
        msg: "Internal Server Error"
    }, {status: 500})
  }
}
