import { z } from "zod";

const MIN_VALUE = 3;
const MAX_VALUE = 128;
export const PostValidator = z.object({
  title: z
    .string()
    .min(MIN_VALUE, {
      message: `Title should have atleast ${MIN_VALUE} characters`,
    })
    .max(MAX_VALUE, {
      message: `Title should have atmost ${MAX_VALUE} characters`,
    }),
  subnedditId: z.string(),
  content: z.any(),
});

export type PostCreationRequest = z.infer<typeof PostValidator>;
