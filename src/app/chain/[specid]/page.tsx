// src/app/chain/[specid]/page.tsx
"use client";

import { Box } from "@radix-ui/themes";
import { useEffect } from "react";
import { useApiFetch } from "@jsinfo/hooks/useApiFetch";
import { usePageContext } from "@jsinfo/context/PageContext";
import StatCard from "@jsinfo/components/sections/StatCard";
import LoadingIndicator from "@jsinfo/components/modern/LoadingIndicator";
import JsinfoTabs from "@jsinfo/components/classic/JsinfoTabs";
import SpecChart from '@jsinfo/app/chain/[specid]/_components/ChainChart';
import { ErrorDisplay } from '@jsinfo/components/modern/ErrorDisplay';
import SpecEndpointHealthSummary from '@jsinfo/app/chain/[specid]/_components/ChainEndpointHealthSummary';
import SpecStakesTable from '@jsinfo/app/chain/[specid]/_components/ChainStakesTable';
import SpecRelaysTable from "./_components/ChainRelaysTable";
import LavaWithTooltip from "@jsinfo/components/modern/LavaWithTooltip";
import { ArrowUpNarrowWide, CreditCard, DatabaseZap, MonitorCog, SquareActivity } from "lucide-react";
import LegacyTheme from "@jsinfo/components/classic/LegacyTheme";
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
      <div style={{ marginTop: '5px' }}></div>
      <ChainsCards specId={specId} />
      <div style={{ marginTop: '30px' }}></div>

      <SpecChart spec={specId} />
      <div className="box-margin-div"></div>
      <div style={{ marginTop: '5px' }}></div>

      <LegacyTheme>
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
            <SpecRelaysTable specid={specId} />
          </Box>
          <Box>
            <SpecStakesTable specid={specId} />
          </Box>
        </JsinfoTabs>
      </LegacyTheme>
    </>
  );
}
