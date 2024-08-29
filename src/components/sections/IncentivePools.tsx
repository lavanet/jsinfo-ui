// src/components/sections/IncentivePools.tsx

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from "lucide-react";
import { Button } from "@jsinfo/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@jsinfo/components/ui/Card";
import { Progress } from "@jsinfo/components/ui/Progress";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@jsinfo/components/ui/Carousel";

export default function IncentivePools() {
  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Incentive Pools</CardTitle>
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
        <Carousel>
          <CarouselContent>
            {[1, 2, 3, 4, 5].map((_, index) => (
              <CarouselItem key={index} className="basis-1/4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>August 2024</CardDescription>
                    <CardTitle className="text-4xl">$1,329</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">25 participating providers</div>
                  </CardContent>
                  <CardFooter>
                    <Progress value={50} aria-label="25 participating providers" />
                  </CardFooter>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </CardContent>
    </Card>
  );
}
