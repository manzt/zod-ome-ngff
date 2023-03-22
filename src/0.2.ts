import { z } from "zod";
import { to_date } from "./shared.js";

export const ImageSchema = z
  .object({
    multiscales: z
      .array(
        z.object({
          name: z.string().optional(),
          datasets: z.array(z.object({ path: z.string() })).min(1),
          version: z.literal("0.2").optional(),
          type: z.string().optional(),
          metadata: z
            .object({
              method: z.string().optional(),
              version: z.string().optional(),
            })
            .and(z.record(z.unknown()))
            .optional(),
        }),
      )
      .min(1)
      .describe("The multiscale datasets for this image"),
    omero: z
      .object({
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
        ),
      })
      .optional(),
  })
  .describe("JSON from OME-NGFF .zattrs");

export const PlateSchema = z
  .object({
    plate: z.object({
      version: z.literal("0.2"),
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
            id: z.number().int(),
            maximumfieldcount: z.number().int().optional(),
            name: z.string().optional(),
            description: z.string().optional(),
            starttime: z
              .number()
              .int()
              .gte(0)
              .describe(
                "The start timestamp of the acquisition, expressed as epoch time i.e. the number seconds since the Epoch",
              )
              .transform(to_date)
              .optional(),
            endtime: z
              .number()
              .int()
              .gte(0)
              .describe(
                "The end timestamp of the acquisition, expressed as epoch time i.e. the number seconds since the Epoch",
              )
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
          .literal("0.2")
          .describe("The version of the specification")
          .optional(),
      }),
  })
  .describe("JSON from OME-NGFF .zattrs");
