import { PrismaClient, Plan, Theme, Mood } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Clear existing data (optional, but good for local testing)
  await prisma.user.deleteMany({});

  // 1. Create a test user
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
      plan: Plan.FREE,
      settings: {
        create: {
          theme: Theme.SYSTEM,
          reminderEnabled: false,
        },
      },
    },
  });
  console.log(`Created user with id: ${user.id}`);

  // 2. Create default journal for this user
  const journal = await prisma.journal.create({
    data: {
      userId: user.id,
      name: "Personal",
      description: "My personal thoughts and reflections.",
      color: "#01696F",
      icon: "📓",
    },
  });
  console.log(`Created journal with id: ${journal.id}`);

  // Set as default journal in user settings
  await prisma.userSettings.update({
    where: { userId: user.id },
    data: { defaultJournalId: journal.id },
  });

  // 3. Create two sample entries
  const entry1 = await prisma.entry.create({
    data: {
      userId: user.id,
      journalId: journal.id,
      title: "First Day with Nothin",
      bodyText: "This is my first entry. I'm excited to start a private journaling practice.",
      body: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "This is my first entry. I'm excited to start a private journaling practice." }],
          },
        ],
      },
      mood: Mood.HIGH,
      entryDate: new Date(),
    },
  });

  const entry2 = await prisma.entry.create({
    data: {
      userId: user.id,
      journalId: journal.id,
      title: "A calm evening",
      bodyText: "Reflecting on the day. The new design system feels really nice.",
      body: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Reflecting on the day. The new design system feels really nice." }],
          },
        ],
      },
      mood: Mood.NEUTRAL,
      entryDate: new Date(Date.now() - 86400000), // Yesterday
      tags: {
        create: [
          {
            tag: {
              create: {
                userId: user.id,
                name: "reflection",
                color: "#4F98A3",
                entryCount: 1,
              },
            },
          },
        ],
      },
    },
  });

  console.log(`Created entries with ids: ${entry1.id}, ${entry2.id}`);
  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
