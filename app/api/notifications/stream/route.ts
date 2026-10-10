import { prisma } from "@/app/lib/db";
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";


async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is missing");
    }

    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);

    if (typeof payload.id !== "string") {
      return null;
    }

    return payload.id;
  } catch (error) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = await getUserIdFromToken(token);
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isConnected = true;

      const sendEvent = (data: any) => {
        if (!isConnected) return;
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      // Send initial keep-alive
      sendEvent({ type: "connected", message: "Notification stream connected" });

      // Poll for new notifications every 2 seconds
      const interval = setInterval(async () => {
        if (!isConnected) {
          clearInterval(interval);
          return;
        }

        try {
          const notifications = await prisma.notification.findMany({
            where: {
              receiverId: userId,
              isRead: false,
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
            take: 10,
          });

          sendEvent({
            type: "notifications",
            data: notifications,
          });
        } catch (error) {
          console.error("Error polling notifications:", error);
        }
      }, 2000);

      // Send keep-alive every 15 seconds
      const keepAlive = setInterval(() => {
        if (!isConnected) {
          clearInterval(keepAlive);
          return;
        }
        controller.enqueue(encoder.encode(": keep-alive\n\n"));
      }, 15000);

      req.signal.addEventListener("abort", () => {
        isConnected = false;
        clearInterval(interval);
        clearInterval(keepAlive);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
