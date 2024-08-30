// src/components/sections/Chains.tsx

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from "lucide-react";
import { Button } from "@jsinfo/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@jsinfo/components/ui/Card";
import ChainsTable from "@jsinfo/components/sections/ChainsTable";

export default function Chains() {
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
          <Link className='orangelinks' href="#">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ChainsTable />
      </CardContent>
    </Card>
  );
}
