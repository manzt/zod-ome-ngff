---
"zod-ome-ngff": minor
---

feat: parse integer datetimes (seconds) as UTC `Date` objects

```typescript
import { StrictPlateSchema } from "zod-ome-ngff";

let { plate } = StrictPlateSchema.parse({ /* ... */ });

for (let acq of plate.acquisitions!) {
  if (acq.starttime) acq.starttime;
                       //^? Date
  if (acq.endtime) acq.endtime;
}                    //^? Date
```
