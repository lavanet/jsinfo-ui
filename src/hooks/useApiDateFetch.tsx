// src/hooks/useApiDateFetch.tsx

import { ConvertDateToServerQueryDate } from "@jsinfo/common/dateutils";
import { useMemo, useState, useEffect } from "react";
import { AxiosDataLoader } from "./AxiosDataLoader";
import { CachedFetchDateRange } from "@jsinfo/common/types";
import { ValidateDataKey } from "./utils";

export default function useApiDateFetch(dataKey: string) {
    const initialRange = useMemo(() => {
        const today = new Date();
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(today.getDate() - 90);
        return { from: ninetyDaysAgo, to: today };
    }, []);

    ValidateDataKey(dataKey);

    const [dates, setDates] = useState<CachedFetchDateRange>(initialRange);

    const apiurlDateRangeQuery = useMemo(() => ({
        from: ConvertDateToServerQueryDate(dates.from),
        to: ConvertDateToServerQueryDate(dates.to)
    }), [dates.from, dates.to]);

    const { fetcher, data, loading, error } = AxiosDataLoader.initialize(dataKey, apiurlDateRangeQuery, null);

    useEffect(() => {
        fetcher.FetchAndPopulateData();
    }, []);

    return { data, loading, error, initialRange, dates, setDates };
}
