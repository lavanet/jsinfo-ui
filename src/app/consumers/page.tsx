// src/app/consumers/page.tsx

"use client";

import React from "react";
import { useEffect } from "react";
import { usePageContext } from "@jsinfo/context/PageContext";
import ConsumersConsumersTable from './_components/ConsumersConsumersTable';
import ClassicTheme from "@jsinfo/components/classic/ClassicTheme";

export default function Home() {

  // const { data, loading, error } = useApiFetch("consumerspage");

  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    //if (!loading && !error) {
    setCurrentPage('consumers');
    //}
    //}, [loading, error, setCurrentPage]);
    //}, [loading, error, setCurrentPage]);
  }, []);

  // if (error) return <ErrorDisplay message={error} />;
  // if (loading) return <LoadingIndicator loadingText="Loading Consumers page" greyText="Consumers" />;

  return (
    <>
      {/* <div className="grid gap-2">
        <CardTitle>Consumers</CardTitle>
        <CardDescription>
          Lava consumer information
        </CardDescription>
      </div>
      <br /> */}
      <ClassicTheme>
        <ConsumersConsumersTable />
      </ClassicTheme>
    </>
  );
}
