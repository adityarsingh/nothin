import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, sessionId: currentSessionId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    
    // Prevent revoking the current session via this route
    if (id === currentSessionId) {
      return new NextResponse("Cannot revoke current session", { status: 400 });
    }

    const client = await clerkClient();
    
    // Verify the session belongs to the user before revoking
    const session = await client.sessions.getSession(id);
    if (session.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await client.sessions.revokeSession(id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/sessions/[id]]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
