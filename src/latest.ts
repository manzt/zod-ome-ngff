// This file is generated by scripts/generate-schemas.mjs
import { z } from "zod";

export const StrictPlateSchema = z
  .object({
    plate: z
      .object({
        acquisitions: z
          .array(
            z.object({
              id: z
                .number()
                .int()
                .gte(0)
                .describe(
                  "A unique identifier within the context of the plate"
                ),
              maximumfieldcount: z
                .number()
                .int()
                .gt(0)
                .describe(
                  "The maximum number of fields of view for the acquisition"
                ),
              name: z.string().describe("The name of the acquisition"),
              description: z
                .string()
                .describe("The description of the acquisition")
                .optional(),
              starttime: z
                .number()
                .int()
                .gte(0)
                .describe(
                  "The start timestamp of the acquisition, expressed as epoch time i.e. the number seconds since the Epoch"
                )
                .optional(),
              endtime: z
                .number()
                .int()
                .gte(0)
                .describe(
                  "The end timestamp of the acquisition, expressed as epoch time i.e. the number seconds since the Epoch"
                )
                .optional(),
            })
          )
          .describe("The acquisitions for this plate")
          .optional(),
        version: z.enum(["0.4"]).describe("The version of the specification"),
        field_count: z
          .number()
          .int()
          .gt(0)
          .describe("The maximum number of fields per view across all wells")
          .optional(),
        name: z.string().describe("The name of the plate"),
        columns: z
          .array(
            z.object({
              name: z
                .string()
                .regex(new RegExp("^[A-Za-z0-9]+$"))
                .describe("The column name"),
            })
          )
          .min(1)
          .describe("The columns of the plate"),
        rows: z
          .array(
            z.object({
              name: z
                .string()
                .regex(new RegExp("^[A-Za-z0-9]+$"))
                .describe("The row name"),
            })
          )
          .min(1)
          .describe("The rows of the plate"),
        wells: z
          .array(
            z.object({
              path: z
                .string()
                .regex(new RegExp("^[A-Za-z0-9]+/[A-Za-z0-9]+$"))
                .describe("The path to the well subgroup"),
              rowIndex: z
                .number()
                .int()
                .gte(0)
                .describe("The index of the well in the rows list"),
              columnIndex: z
                .number()
                .int()
                .gte(0)
                .describe("The index of the well in the columns list"),
            })
          )
          .min(1)
          .describe("The wells of the plate"),
      })
      .optional(),
  })
  .describe("JSON from OME-NGFF .zattrs");


export const Bf2RawSchema = z
  .object({
    "bioformats2raw.layout": z
      .literal(3)
      .describe("The top-level identifier metadata added by bioformats2raw")
      .optional(),
  })
  .describe("JSON from OME-NGFF .zattrs");


export const ImageSchema = z
  .object({
    multiscales: z
      .array(
        z.object({
          name: z.string().optional(),
          datasets: z
            .array(
              z.object({
                path: z.string(),
                coordinateTransformations: z.array(
                  z.union([
                    z.object({ type: z.enum(["identity"]) }),
                    z.object({
                      type: z.enum(["scale"]),
                      scale: z.array(z.number()).min(2),
                    }),
                    z.object({
                      type: z.enum(["translation"]),
                      translation: z.array(z.number()).min(2),
                    }),
                  ])
                ),
              })
            )
            .min(1),
          version: z.enum(["0.5-dev"]).optional(),
          axes: z.array(
            z.object({
              name: z.string().optional(),
              type: z.string().optional(),
              units: z.string().optional(),
            })
          ),
          coordinateTransformations: z
            .array(
              z.union([
                z.object({ type: z.enum(["identity"]) }),
                z.object({
                  type: z.enum(["scale"]),
                  scale: z.array(z.number()).min(2),
                }),
                z.object({
                  type: z.enum(["translation"]),
                  translation: z.array(z.number()).min(2),
                }),
              ])
            )
            .optional(),
        })
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
          })
        ),
      })
      .optional(),
  })
  .describe("JSON from OME-NGFF .zattrs");


export const OmeSchema = z
  .object({
    series: z
      .array(z.string())
      .describe(
        "An array of the same length and the same order as the images defined in the OME-XML"
      )
      .optional(),
  })
  .describe("JSON from OME-NGFF OME/.zattrs linked to an OME-XML file");


export const LabelSchema = z
  .object({
    "image-label": z
      .object({
        colors: z
          .array(
            z.object({
              "label-value": z.number().describe("The value of the label"),
              rgba: z
                .array(z.number().int().gte(0).lte(255))
                .min(4)
                .max(4)
                .describe(
                  "The RGBA color stored as an array of four integers between 0 and 255"
                )
                .optional(),
            })
          )
          .min(1)
          .describe("The colors for this label image")
          .optional(),
        properties: z
          .array(
            z.object({
              "label-value": z
                .number()
                .int()
                .describe("The pixel value for this label"),
            })
          )
          .min(1)
          .describe("The properties for this label image")
          .optional(),
        source: z
          .object({ image: z.string().optional() })
          .describe("The source of this label image")
          .optional(),
        version: z
          .enum(["0.5-dev"])
          .describe("The version of the specification")
          .optional(),
      })
      .optional(),
  })
  .describe("JSON from OME-NGFF .zattrs");


export const StrictImageSchema = z
  .object({
    multiscales: z
      .array(
        z.object({
          name: z.string(),
          datasets: z
            .array(
              z.object({
                path: z.string(),
                coordinateTransformations: z
                  .array(
                    z.any().superRefine((x, ctx) => {
                      const schemas = [
                        z.object({
                          type: z.enum(["scale"]),
                          scale: z.array(z.number()).min(2),
                        }),
                        z.object({
                          type: z.enum(["translation"]),
                          translation: z.array(z.number()).min(2),
                        }),
                      ];
                      const errors = schemas.reduce(
                        (errors: z.ZodError[], schema) =>
                          ((result) =>
                            "error" in result
                              ? [...errors, result.error]
                              : errors)(schema.safeParse(x)),
                        []
                      );
                      if (schemas.length - errors.length !== 1) {
                        ctx.addIssue({
                          path: ctx.path,
                          code: "invalid_union",
                          unionErrors: errors,
                          message: "Invalid input: Should pass single schema",
                        });
                      }
                    })
                  )
                  .min(1),
              })
            )
            .min(1),
          version: z.enum(["0.5-dev"]),
          axes: z
            .array(
              z.any().superRefine((x, ctx) => {
                const schemas = [
                  z.object({
                    name: z.string(),
                    type: z.enum(["channel", "time", "space"]),
                  }),
                  z.object({
                    name: z.string(),
                    type: z
                      .any()
                      .refine(
                        (value) =>
                          !z.enum(["space", "time", "channel"]).safeParse(value)
                            .success,
                        "Invalid input: Should NOT be valid against schema"
                      )
                      .optional(),
                  }),
                ];
                const errors = schemas.reduce(
                  (errors: z.ZodError[], schema) =>
                    ((result) =>
                      "error" in result ? [...errors, result.error] : errors)(
                      schema.safeParse(x)
                    ),
                  []
                );
                if (schemas.length - errors.length !== 1) {
                  ctx.addIssue({
                    path: ctx.path,
                    code: "invalid_union",
                    unionErrors: errors,
                    message: "Invalid input: Should pass single schema",
                  });
                }
              })
            )
            .min(2)
            .max(5),
          coordinateTransformations: z
            .array(
              z.any().superRefine((x, ctx) => {
                const schemas = [
                  z.object({
                    type: z.enum(["scale"]),
                    scale: z.array(z.number()).min(2),
                  }),
                  z.object({
                    type: z.enum(["translation"]),
                    translation: z.array(z.number()).min(2),
                  }),
                ];
                const errors = schemas.reduce(
                  (errors: z.ZodError[], schema) =>
                    ((result) =>
                      "error" in result ? [...errors, result.error] : errors)(
                      schema.safeParse(x)
                    ),
                  []
                );
                if (schemas.length - errors.length !== 1) {
                  ctx.addIssue({
                    path: ctx.path,
                    code: "invalid_union",
                    unionErrors: errors,
                    message: "Invalid input: Should pass single schema",
                  });
                }
              })
            )
            .min(1)
            .optional(),
        })
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
          })
        ),
      })
      .optional(),
  })
  .describe("JSON from OME-NGFF .zattrs");


export const PlateSchema = z
  .object({
    plate: z
      .object({
        acquisitions: z
          .array(
            z.object({
              id: z
                .number()
                .int()
                .gte(0)
                .describe(
                  "A unique identifier within the context of the plate"
                ),
              maximumfieldcount: z
                .number()
                .int()
                .gt(0)
                .describe(
                  "The maximum number of fields of view for the acquisition"
                )
                .optional(),
              name: z
                .string()
                .describe("The name of the acquisition")
                .optional(),
              description: z
                .string()
                .describe("The description of the acquisition")
                .optional(),
              starttime: z
                .number()
                .int()
                .gte(0)
                .describe(
                  "The start timestamp of the acquisition, expressed as epoch time i.e. the number seconds since the Epoch"
                )
                .optional(),
              endtime: z
                .number()
                .int()
                .gte(0)
                .describe(
                  "The end timestamp of the acquisition, expressed as epoch time i.e. the number seconds since the Epoch"
                )
                .optional(),
            })
          )
          .describe("The acquisitions for this plate")
          .optional(),
        version: z
          .enum(["0.5-dev"])
          .describe("The version of the specification")
          .optional(),
        field_count: z
          .number()
          .int()
          .gt(0)
          .describe("The maximum number of fields per view across all wells")
          .optional(),
        name: z.string().describe("The name of the plate").optional(),
        columns: z
          .array(
            z.object({
              name: z
                .string()
                .regex(new RegExp("^[A-Za-z0-9]+$"))
                .describe("The column name"),
            })
          )
          .min(1)
          .describe("The columns of the plate"),
        rows: z
          .array(
            z.object({
              name: z
                .string()
                .regex(new RegExp("^[A-Za-z0-9]+$"))
                .describe("The row name"),
            })
          )
          .min(1)
          .describe("The rows of the plate"),
        wells: z
          .array(
            z.object({
              path: z
                .string()
                .regex(new RegExp("^[A-Za-z0-9]+/[A-Za-z0-9]+$"))
                .describe("The path to the well subgroup"),
              rowIndex: z
                .number()
                .int()
                .gte(0)
                .describe("The index of the well in the rows list"),
              columnIndex: z
                .number()
                .int()
                .gte(0)
                .describe("The index of the well in the columns list"),
            })
          )
          .min(1)
          .describe("The wells of the plate"),
      })
      .optional(),
  })
  .describe("JSON from OME-NGFF .zattrs");


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
            })
          )
          .min(1)
          .describe("The fields of view for this well"),
        version: z
          .enum(["0.5-dev"])
          .describe("The version of the specification")
          .optional(),
      })
      .optional(),
  })
  .describe("JSON from OME-NGFF .zattrs");


export const StrictLabelSchema = z
  .object({
    "image-label": z
      .object({
        colors: z
          .array(
            z.object({
              "label-value": z.number().describe("The value of the label"),
              rgba: z
                .array(z.number().int().gte(0).lte(255))
                .min(4)
                .max(4)
                .describe(
                  "The RGBA color stored as an array of four integers between 0 and 255"
                )
                .optional(),
            })
          )
          .min(1)
          .describe("The colors for this label image"),
        properties: z
          .array(
            z.object({
              "label-value": z
                .number()
                .int()
                .describe("The pixel value for this label"),
            })
          )
          .min(1)
          .describe("The properties for this label image")
          .optional(),
        source: z
          .object({ image: z.string().optional() })
          .describe("The source of this label image")
          .optional(),
        version: z
          .enum(["0.5-dev"])
          .describe("The version of the specification"),
      })
      .optional(),
  })
  .describe("JSON from OME-NGFF .zattrs");


export const StrictWellSchema = z
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
            })
          )
          .min(1)
          .describe("The fields of view for this well"),
        version: z.enum(["0.4"]).describe("The version of the specification"),
      })
      .optional(),
  })
  .describe("JSON from OME-NGFF .zattrs");
