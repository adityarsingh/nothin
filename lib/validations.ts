import { z } from "zod";
import { Mood } from "@prisma/client";

export const entrySchema = z.object({
  title: z.string().optional().nullable(),
  body: z.any().optional().nullable(), // TipTap JSON
  mood: z.nativeEnum(Mood).optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  people: z.array(z.string()).optional().default([]),
  place: z.string().optional().nullable(),
  journalId: z.string().min(1, "Journal ID is required"),
  entryDate: z.string().datetime({ message: "Invalid ISO date string" }),
  isLocked: z.boolean().optional().default(false),
  isPinned: z.boolean().optional().default(false),
});
