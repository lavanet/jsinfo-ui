// src/hooks/useApiDateFetch.tsx

import { GetTodayMinus90DaysRangeDefault, CheckAndAdjustDatesForServer } from "@jsinfo/common/dateutils";
import { useEffect, useState } from "react";
import { AxiosDataLoader } from "./AxiosDataLoader";
import { CachedFetchDateRange } from "@jsinfo/common/types";
import { ValidateDataKey } from "./utils";

export default function useApiDateFetch(dataKey: string) {

    ValidateDataKey(dataKey);

    const { fetcher, data, loading, error } = AxiosDataLoader.initialize(dataKey, null, null);

    const [dates, setDatesInner] = useState<CachedFetchDateRange>(GetTodayMinus90DaysRangeDefault());

    useEffect(() => {
        fetcher.SetApiUrlDateRangeQueryFromDateRange(GetTodayMinus90DaysRangeDefault());
        fetcher.FetchAndPopulateData();
    }, []);

    function setDates(dates: CachedFetchDateRange) {
        let c_dates = CheckAndAdjustDatesForServer(dates);
        if (!c_dates) return;
        if (JSON.stringify(dates) === JSON.stringify(c_dates)) {
            return;
        }
        fetcher.SetApiUrlDateRangeQueryFromDateRange(c_dates);
        fetcher.FetchAndPopulateData();
        setDatesInner(c_dates);
    }

    return { data, loading, error, dates, setDates };
}
