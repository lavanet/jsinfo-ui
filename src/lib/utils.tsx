// src/common/utils.tsx

import { SortAndPaginationConfig, SortConfig } from "./types";
import { Card } from "@radix-ui/themes";

export function GetNestedProperty(obj: Record<string, any>, key: string): any {
  if (key.includes(",")) {
    return key
      .split(",")
      .map((k: string) => GetNestedProperty(obj, k.trim()))
      .join("_");
  }

  return key.split(".").reduce((o: any, i: string) => {
    if (o === null || o === undefined || !o.hasOwnProperty(i)) {
      throw new Error(`Key "${i}" does not exist on object`);
    }
    return o[i];
  }, obj);
}

export function ConvertToSortConfig(config: SortAndPaginationConfig): SortConfig {
  return {
    key: config.sortKey,
    direction: config.direction
  };
}

export function RenderInFullPageCard(message: string | React.ReactNode) {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', marginTop: '5px', marginRight: '5px', marginBottom: '15px', marginLeft: '5px' }}>
        {message}
      </div>
    </Card>
  );
}


