import { z } from "zod";

let Multiscalesv01 = z.array(
  z.object({
    name: z.string().optional(),
    datasets: z.array(z.object({ path: z.string() })).min(1),
    version: z.literal("0.1").optional(),
    metadata: z
      .object({
        method: z.string().optional(),
        version: z.string().optional(),
      })
      .optional(),
  }),
)
  .min(1)
  .describe("The multiscale datasets for this image");
