import { z } from "zod";

const postOrderSchema = z
  .object({
    product: z.string(),
    amount: z.number().max(100000).min(1),
  })
  .strict();

export default postOrderSchema;
