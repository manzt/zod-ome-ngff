import { z } from "zod";

type PickRequired<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;

// Plate
const Aquisitions = z
  .array(
    z.object({
      id: z
        .number()
        .int()
        .gte(0)
        .describe(
          "A unique identifier within the context of the plate",
        ),
      maximumfieldcount: z
        .number()
        .int()
        .gt(0)
        .describe(
          "The maximum number of fields of view for the acquisition",
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
          "The start timestamp of the acquisition, expressed as epoch time i.e. the number seconds since the Epoch",
        )
        .optional(),
      endtime: z
        .number()
        .int()
        .gte(0)
        .describe(
          "The end timestamp of the acquisition, expressed as epoch time i.e. the number seconds since the Epoch",
        )
        .optional(),
    }),
  )
  .describe("The acquisitions for this plate");

const Columns = z
  .array(
    z.object({
      name: z
        .string()
        .regex(new RegExp("^[A-Za-z0-9]+$"))
        .describe("The column name"),
    }),
  )
  .min(1)
  .superRefine((rows, ctx) => {
    let names = rows.map((row) => row.name);
    if (rows.length !== new Set(names).size) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `No duplicates columns allowed.`,
      });
    }
  })
  .describe("The columns of the plate");

const Rows = z
  .array(
    z.object({
      name: z
        .string()
        .regex(new RegExp("^[A-Za-z0-9]+$"))
        .describe("The row name"),
    }),
  )
  .min(1)
  .superRefine((rows, ctx) => {
    let names = rows.map((row) => row.name);
    if (rows.length !== new Set(names).size) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `No duplicates rows allowed.`,
      });
    }
  })
  .describe("The rows of the plate");

const PlateWells = z
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
    }),
  )
  .min(1)
  .describe("The wells of the plate")
  .optional();

export const PlateSchema = z
  .object({
    plate: z
      .object({
        aquisitions: Aquisitions.optional(),
        version: z
          .literal("0.5-dev")
          .describe("The version of the specification")
          .optional(),
        field_count: z
          .number()
          .int()
          .gt(0)
          .describe("The maximum number of fields per view across all wells")
          .optional(),
        name: z.string().describe("The name of the plate").optional(),
        columns: Columns,
        rows: Rows,
        wells: PlateWells,
      }),
  })
  .describe("JSON from OME-NGFF .zattrs");

type Plate = z.infer<typeof PlateSchema>["plate"];

type StrictAquisition = PickRequired<
  z.infer<typeof Aquisitions.element>,
  "name" | "maximumfieldcount"
>;
type StrictPlateSchema = {
  plate: PickRequired<Omit<Plate, "aquisitions">, "version" | "name"> & {
    aquisitions?: StrictAquisition[];
  };
};

export const StrictPlateSchema = PlateSchema.refine(
  (val): val is StrictPlateSchema => {
    return "version" in val.plate && "name" in val.plate && (
      (val.plate.aquisitions ?? []).every((aq) => {
        return "name" in aq && "maximumfieldcount" in aq;
      })
    );
  },
);

// Bf2Raw

export const Bf2RawSchema = z
  .object({
    "bioformats2raw.layout": z
      .literal(3)
      .describe("The top-level identifier metadata added by bioformats2raw"),
  })
  .describe("JSON from OME-NGFF .zattrs");

// Ome

export const OmeSchema = z
  .object({
    series: z
      .array(z.string())
      .describe(
        "An array of the same length and the same order as the images defined in the OME-XML",
      ),
  })
  .describe("JSON from OME-NGFF OME/.zattrs linked to an OME-XML file");

// Image
//
const Axis = z.object({
  name: z.string(),
  type: z.string().optional(),
  units: z.string().optional(),
});

const CoordinateTransformation = z.union([
  z.object({ type: z.enum(["identity"]) }),
  z.object({
    type: z.enum(["scale"]),
    scale: z.array(z.number()).min(2),
  }),
  z.object({
    type: z.enum(["translation"]),
    translation: z.array(z.number()).min(2),
  }),
]);

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
                coordinateTransformations: z.array(CoordinateTransformation),
              }),
            )
            .min(1),
          version: z.literal("0.5-dev").optional(),
          axes: z.array(Axis),
          coordinateTransformations: z.array(CoordinateTransformation)
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

type StrictImageSchema = {
  multiscales: PickRequired<
    z.infer<typeof ImageSchema>["multiscales"][number],
    "version" | "name"
  >[];
  omero: z.infer<typeof ImageSchema>["omero"];
};

export const StrictImageSchema = ImageSchema.refine(
  (val): val is StrictImageSchema => {
    return "version" in val && "name" in val;
  },
);

// Label

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
                  "The RGBA color stored as an array of four integers between 0 and 255",
                )
                .optional(),
            }),
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
            }),
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
      }),
  })
  .describe("JSON from OME-NGFF .zattrs");

export const StrictLabelSchema = LabelSchema.refine((val): val is {
  "image-label": PickRequired<
    z.infer<typeof LabelSchema>["image-label"],
    "version" | "colors"
  >;
} => {
  return "version" in val["image-label"] && "colors" in val["image-label"];
});

// Well

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
          .literal("0.5-dev")
          .describe("The version of the specification")
          .optional(),
      }),
  })
  .describe("JSON from OME-NGFF .zattrs");

export const StrictWellSchema = WellSchema.refine((val): val is {
  well: PickRequired<z.infer<typeof WellSchema>["well"], "version">;
} => {
  return "version" in val.well;
});
