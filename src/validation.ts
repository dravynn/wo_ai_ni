import { z } from "zod";

export const QuoteRequestSchema = z.object({
  userId: z.string().min(1),
  principal: z.number().gt(0),
  leverage: z.number().int().gte(1).lte(150),
  durationHours: z.number().int().refine((v) => [8, 24, 168].includes(v), {
    message: "durationHours must be one of 8, 24, 168",
  }),
});

export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;
