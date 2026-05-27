import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import UAParser from "ua-parser-js";

export async function GET() {
  try {
    const { userId, sessionId: currentSessionId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const client = await clerkClient();
    const sessions = await client.sessions.getSessionList({ userId });

    const formattedSessions = sessions.data.map(session => {
      // Parse User-Agent
      // Clerk might not expose user_agent natively in Session object in some versions,
      // wait, they expose latestActivity, browser, device, OS natively or we can use ua-parser if they provide raw UA.
      // Clerk's Session has: id, status, lastActiveAt, abandonAt, expireAt, browser, os, ipAddress etc.
      
      // We will extract what's available
      // @ts-ignore - Clerk types vary, but typically it's session.latestActivity?.deviceType etc or we can just send the whole session object back.
      return {
        id: session.id,
        isCurrent: session.id === currentSessionId,
        lastActiveAt: session.lastActiveAt,
        status: session.status,
        // @ts-ignore
        browser: session.latestActivity?.browserName || session.browserName || "Unknown Browser",
        // @ts-ignore
        os: session.latestActivity?.osName || session.osName || "Unknown OS",
        // @ts-ignore
        ipAddress: session.latestActivity?.ipAddress || session.ipAddress || "Hidden IP",
      };
    });

    return NextResponse.json(formattedSessions);
  } catch (error) {
    console.error("[GET /api/sessions]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
