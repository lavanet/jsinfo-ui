// src/app/_components/IndexChainsTableBlock.tsx

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from "lucide-react";
import { Button } from "@jsinfo/components/radixui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@jsinfo/components/radixui/Card";
import IndexChainsTable from "@jsinfo/app/_components/IndexChainsTable";

export default function IndexChainsTableBlock() {
  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Chains</CardTitle>
          <CardDescription>
            Recent transactions from your store.
          </CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/chains">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <IndexChainsTable />
      </CardContent>
    </Card>
  );
}
