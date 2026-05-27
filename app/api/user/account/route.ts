import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // Delete user from local database (Prisma handles cascading deletes for entries, journals, tags, etc.)
    await prisma.user.delete({
      where: { id: userId }
    });

    // Delete user from Clerk auth
    const client = await clerkClient();
    await client.users.deleteUser(userId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/user/account]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
