// src/components/sections/UsageGraphSkeleton.tsx

import React from "react";
import { Skeleton } from "@jsinfo/components/ui/Skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@jsinfo/components/ui/Card";

const UsageGraphSkeleton = () => {
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-2 space-y-0 pb-4 sm:pb-2">
        <div className="space-y-1 w-full sm:w-auto">
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto w-full sm:w-auto">
          <Skeleton className="h-9 w-full sm:w-[200px]" />
          <Skeleton className="h-9 w-full sm:w-[300px]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center">
              <Skeleton className="h-3 w-3 rounded-full mr-2" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageGraphSkeleton;