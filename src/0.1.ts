import { z } from "zod";
import { to_date } from "./shared.js";

const StrictMultiscale = z.object({
  name: z.string(),
  datasets: z.array(z.object({ path: z.string() })).min(1),
  version: z.literal("0.1"),
  metadata: z
    .object({
      method: z.string().optional(),
      version: z.string().optional(),
    }),
});

const Multiscale = StrictMultiscale.partial({
  name: true,
  version: true,
  metadata: true,
});

const Omero = z.object({
  channels: z.array(
    z.object({
      window: z.object({
        end: z.number(),
        max: z.number(),
        min: z.number(),
        start: z.number(),
      }),
      label: z.string().optional(),
      family: z.string().optional(),
      color: z.string(),
      active: z.boolean().optional(),
    }),
  ).optional(),
});

function createImageSchema<T extends z.ZodTypeAny>(multiscale: T) {
  return z
    .object({
      multiscales: z.array(multiscale).min(1).describe(
        "The multiscale datasets for this image",
      ),
      omero: Omero.optional(),
    })
    .describe("JSON from OME-NGFF .zattrs");
}

export const ImageSchema = createImageSchema(Multiscale);
export const StrictImageSchema = createImageSchema(StrictMultiscale);

export const PlateSchema = z
  .object({
    plate: z.object({
      version: z.literal("0.1"),
      name: z.string().optional(),
      columns: z
        .array(z.object({ name: z.string() }))
        .min(1)
        .describe("Columns of the Plate grid"),
      rows: z
        .array(z.object({ name: z.string() }))
        .min(1)
        .describe("Rows of the Plate grid"),
      wells: z
        .array(z.object({ path: z.string() }))
        .min(1)
        .describe("Rows of the Plate grid"),
      field_count: z
        .any()
        .describe("Maximum number of fields per view across all wells.")
        .optional(),
      acquisitions: z
        .array(
          z.object({
            id: z.number(),
            maximumfieldcount: z.number().optional(),
            name: z.string().optional(),
            description: z.string().optional(),
            starttime: z
              .number()
              .int()
              .gt(0)
              .transform(to_date)
              .optional(),
          }),
        )
        .min(1)
        .describe("Rows of the Plate grid")
        .optional(),
    }),
  })
  .describe("JSON from OME-NGFF Plate .zattrs");

export const WellSchema = z
  .object({
    well: z
      .object({
        images: z
          .array(
            z.object({
              acquisition: z
                .number()
                .int()
                .describe("A unique identifier within the context of the plate")
                .optional(),
              path: z
                .string()
                .regex(new RegExp("^[A-Za-z0-9]+$"))
                .describe("The path for this field of view subgroup"),
            }),
          )
          .min(1)
          .describe("The fields of view for this well"),
        version: z
          .literal("0.1")
          .describe("The version of the specification")
          .optional(),
      }),
  })
  .describe("JSON from OME-NGFF .zattrs");
