import { z } from "zod";

export const SubnedditValidator = z.object({
  name: z.string().min(3).max(21),
});

export const SubnedditSubscriptionValidator = z.object({
  sunnedditId: z.string(),
});

export type CreateSubnedditPayload = z.infer<typeof SubnedditValidator>;
export type SubnedditSubscriptionPayload = z.infer<
  typeof SubnedditSubscriptionValidator
>;
