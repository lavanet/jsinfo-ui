// src/components/sections/Providers.tsx

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from "lucide-react";
import { Button } from "@jsinfo/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@jsinfo/components/ui/Card";
import ProvidersTable from "@jsinfo/components/sections/ProvidersTable";

export default function Providers() {
  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Providers</CardTitle>
          <CardDescription>
            Recent provider statistics.
          </CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="#">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ProvidersTable />
      </CardContent>
    </Card>
  );
}
