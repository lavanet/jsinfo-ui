// src/app/chain/[specid]/page.tsx
"use client";

import { Box } from "@radix-ui/themes";
import { useEffect } from "react";
import { usePageContext } from "@jsinfo/context/PageContext";
import JsinfoTabs from "@jsinfo/components/classic/JsinfoTabs";
import SpecChart from '@jsinfo/app/chain/[specid]/_components/ChainChart';
import { ErrorDisplay } from '@jsinfo/components/modern/ErrorDisplay';
import ChainStakesTable from './_components/ChainStakesTable';
import ChainRelaysTable from "./_components/ChainRelaysTable";
import BackToSpecsLink from "./_components/BackToChains";
import ChainsCards from "./_components/ChainCards";

export default function Spec({ params }: { params: { specid: string } }) {

  let decodedSpecId = decodeURIComponent(params.specid);

  const specIdPattern = /^[A-Za-z0-9]+$/;

  if (!specIdPattern.test(decodedSpecId)) {
    const error = 'Invalid spec format';
    return <ErrorDisplay message={error} />;
  }
  const { setCurrentPage } = usePageContext();

  useEffect(() => {
    setCurrentPage('chain/' + decodedSpecId);
  }, [decodedSpecId, setCurrentPage]);

  const specId = decodedSpecId;

  return (
    <>
      <BackToSpecsLink />

      <div style={{ marginLeft: '23px' }}>
        <h1 className="text-3xl font-bold mb-4">{decodedSpecId}</h1>
      </div>

      <div style={{ marginTop: '5px' }}></div>
      <ChainsCards specId={specId} />
      <div style={{ marginTop: '30px' }}></div>

      <div className="many-legend-chart">
        <SpecChart spec={specId} />
      </div>

      <div style={{ marginTop: '25px' }}></div>

      <JsinfoTabs defaultValue="relays"
        tabs={[
          {
            value: "relays",
            content: "Provider Relays",
          },
          {
            value: "stakes",
            content: "Provider Stakes",
          },
        ]}
      >
        <Box>
          <ChainRelaysTable specid={specId} />
        </Box>
        <Box>
          <ChainStakesTable specid={specId} />
        </Box>
      </JsinfoTabs>
    </>
  );
}
