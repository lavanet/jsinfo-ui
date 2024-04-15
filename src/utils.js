import Dayjs from "dayjs";
import relativeTIme from "dayjs/plugin/relativeTime";
Dayjs.extend(relativeTIme);
const formatter = Intl.NumberFormat("en");

export function GetRestUrl() {
  return process.env["REST_URL"];
}

export function EventTypeToString(evtType) {
  switch (evtType) {
    case 1:
      return "Stake New Provider";
    case 2:
      return "Stake Update Provider";
    case 3:
      return "Provider Unstake Commit";
    case 4:
      return "Freeze Provider";
    case 5:
      return "Unfreeze Provider";
    case 6:
      return "Add Key To Project";
    case 7:
      return "Add Project To Subscription";
    case 8:
      return "Conflict Detection Received";
    case 9:
      return "Del Key From Project";
    case 10:
      return "Del Project To Subscription";
    case 11:
      return "Provider Jailed";
    case 12:
      return "Vote Got Reveal";
    case 13:
      return "Vote Reveal Started";
    case 14:
      return "Detection Vote Resolved";
    case 15:
      return "Detection Vote Unresolved";

    default:
      return "Unknown Event Type";
  }
}

export function StatusToString(status) {
  switch (status) {
    case 1:
      return "Active";
    case 2:
      return "Frozen";
    case 3:
      return "Unstaking";
    case 4:
      return "Inactive";
    default:
      return "Unknown";
  }
}

export function GeoLocationToString(geo) {
  if (geo == 0) {
    return "Global-strict";
  }
  if (geo == 0xffff) {
    return "Global";
  }

  let geos = [];
  if (geo & 0x1) {
    geos.push("US-Center");
  }
  if (geo & 0x2) {
    geos.push("Europe");
  }
  if (geo & 0x4) {
    geos.push("US-East");
  }
  if (geo & 0x8) {
    geos.push("US-West");
  }
  if (geo & 0x10) {
    geos.push("Africa");
  }
  if (geo & 0x20) {
    geos.push("Asia");
  }
  if (geo & 0x40) {
    geos.push("Australia & New-Zealand");
  }
  return geos.join(",");
}

export function SetLastDotHighInChartData(chartData) {
  chartData.datasets.forEach((dataset, datasetIndex) => {
    const previousDataPoints = dataset.data.slice(0, -1);
    const sortedDataPoints = previousDataPoints.sort((a, b) => {
      if (a.y === undefined || b.y === undefined) {
        console.info(
          `SetLastDotHighInChartData:: Data point's y property is undefined. Data points: ${JSON.stringify(
            a
          )}, ${JSON.stringify(b)}`
        );
        return 0;
      }
      return parseFloat(a.y) - parseFloat(b.y);
    });

    const lowerThirdIndex = Math.floor(sortedDataPoints.length / 1.5);
    const adjustedDataPoints = sortedDataPoints.slice(lowerThirdIndex);

    let median;
    if (adjustedDataPoints.length % 2 === 0) {
      const midIndex1 = adjustedDataPoints.length / 2 - 1;
      const midIndex2 = adjustedDataPoints.length / 2;

      if (
        !(
          adjustedDataPoints[midIndex1] &&
          adjustedDataPoints[midIndex1].y &&
          adjustedDataPoints[midIndex2] &&
          adjustedDataPoints[midIndex2].y
        )
      ) {
        console.info(
          "SetLastDotHighInChartData:: adjustedDataPoints does not have valid elements at indices " +
            midIndex1 +
            " and " +
            midIndex2 +
            ". adjustedDataPoints: ",
          adjustedDataPoints
        );
        return;
      }

      median =
        (parseFloat(adjustedDataPoints[midIndex1].y) +
          parseFloat(adjustedDataPoints[midIndex2].y)) /
        2;
    } else {
      median = parseFloat(
        adjustedDataPoints[(adjustedDataPoints.length - 1) / 2].y
      );
    }

    const lastDataPoint = dataset.data[dataset.data.length - 1];

    if (!lastDataPoint) {
      console.info(
        `SetLastDotHighInChartData:: The last data point in dataset ${datasetIndex} is undefined.`
      );
      return;
    }

    if (lastDataPoint.y === undefined) {
      console.info(
        `SetLastDotHighInChartData:: The last data point's y property in dataset ${datasetIndex} is undefined. Data point: ${JSON.stringify(
          lastDataPoint
        )}`
      );
      return;
    }

    if (dataset.data.length < 3) {
      lastDataPoint.y = Math.max(median, parseFloat(lastDataPoint.y));
    } else {
      const secondLastDataPoint = dataset.data[dataset.data.length - 2];
      const thirdLastDataPoint = dataset.data[dataset.data.length - 3];

      if (!secondLastDataPoint || !thirdLastDataPoint) {
        console.info(
          `SetLastDotHighInChartData:: One of the last three data points in dataset ${datasetIndex} is undefined.`
        );
        return;
      }

      if (
        secondLastDataPoint.y === undefined ||
        thirdLastDataPoint.y === undefined
      ) {
        console.info(
          `SetLastDotHighInChartData:: One of the last three data points' y property in dataset ${datasetIndex} is undefined. Data points: ${JSON.stringify(
            secondLastDataPoint
          )}, ${JSON.stringify(thirdLastDataPoint)}`
        );
        return;
      }

      const previousDataPointAverage =
        (parseFloat(secondLastDataPoint.y) +
          parseFloat(thirdLastDataPoint.y) +
          parseFloat(lastDataPoint.y)) /
        3;

      lastDataPoint.y = Math.max(median, previousDataPointAverage);
    }
  });
}

export function SetLastPointToLineInChartOptions(chartOptions) {
  if (!chartOptions.elements) {
    chartOptions.elements = {};
  }

  if (!chartOptions.elements.point) {
    chartOptions.elements.point = {};
  }

  if (!chartOptions.elements.point.radius) {
    chartOptions.elements.point.radius = function (context) {
      const index = context.dataIndex;
      const count = context.dataset.data.length;
      return index === count - 1 ? 2 : 1;
    };
  }

  if (!chartOptions.elements.point.pointStyle) {
    chartOptions.elements.point.pointStyle = function (context) {
      const index = context.dataIndex;
      const count = context.dataset.data.length;
      return index === count - 1 ? "dash" : "circle";
    };
  }

  return chartOptions;
}

export function GetNestedProperty(obj, key) {
  if (key.includes(",")) {
    return key
      .split(",")
      .map((k) => GetNestedProperty(obj, k.trim()))
      .join("_");
  }

  return key.split(".").reduce((o, i) => {
    if (o === null || o === undefined || !o.hasOwnProperty(i)) {
      return "";
    }
    return o[i];
  }, obj);
}

export function ConvertToChainName(abbreviation) {
  const mapping = {
    ETH1: "Ethereum",
    EVMOS: "Evmos",
    NEAR: "NEAR",
    NEART: "NEAR Testnet",
    EVMOST: "Evmos Testnet",
    ARB1: "Arbitrum",
    POLYGON1: "Polygon",
    CELO: "Celo",
    STRK: "Starknet",
    AXELAR: "Axelar",
    AXELART: "Axelar Testnet",
    COS5: "Cosmos Hub",
    STRKT: "Starknet Goerli",
    BERAT: "Berachain Testnet",
    APT1: "Aptos",
    SOLANA: "Solana",
    POLYGON1T: "Polygon Testnet",
    OPTM: "Optimism",
    BASE: "Base",
    ARBN: "Arbitrum Nova",
    AVAX: "Avalanche",
    LAV1: "Lava Testnet",
    GTH1: "ETH Goerli",
    COS3: "Osmosis",
    SEP1: "ETH Sepolia",
    AGRT: "Agoric Testnet",
    AGR: "Agoric",
    FTM250: "Fantom",
    CANTO: "Canto",
    BASET: "Base Testnet",
    JUN1: "Juno",
    OPTMT: "Optimism Testnet",
    ALFAJORES: "Celo Alfajores Testnet",
    BLAST: "Blast",
    FVM: "Filecoin",
    COS4: "Osmosis Testnet",
    SOLANAT: "Solana Testnet",
    STRKS: "Starknet Sepolia",
    BSC: "BSC",
    JUNT1: "Juno Testnet",
    COSMOSWASM: "CosmWasm",
    KOII: "Koii",
    KOIIT: "Koii Testnet",
    BSCT: "BSC Testnet",
    IBC: "Inter-Blockchain Communication",
    MANTLE: "Mantle",
    STRGZ: "Stargaze",
    STRGZT: "Stargaze Testnet",
    AGR: "Agoric",
    AGRT: "Agoric Testnet",
    BLASTSP: "Blast Special",
    CELO: "Celo",
    COS5T: "Cosmos Hub Testnet",
    OPTMS: "Optimism Staging",
    ARBS: "Arbitrum Staging",
    FUSE: "Fuse",
    SUIT: "Sui",
    COSMOSSDKFULL: "Cosmos SDK Full",
    COSMOSSDK: "Cosmos SDK",
    SQDSUBGRAPH: "Subsquid Subgraphs",
    FTM4002: "Fantom Testnet",
    MORALIS: "Moralis",
  };

  return mapping[abbreviation] || "";
}

export const FormatTimeDifference = (date) => {
  const minutesAgo = Dayjs().diff(Dayjs(new Date(date)), "minute");
  if (minutesAgo < 60) {
    return `${minutesAgo} minutes ago`;
  } else if (minutesAgo < 1440) {
    // 1440 minutes in a day
    let hoursAgo = (minutesAgo / 60).toFixed(1);
    hoursAgo = hoursAgo.endsWith(".0") ? hoursAgo.slice(0, -2) : hoursAgo;
    return `${hoursAgo} hours ago`;
  }
  let daysAgo = (minutesAgo / 1440).toFixed(1);
  daysAgo = daysAgo.endsWith(".0") ? daysAgo.slice(0, -2) : daysAgo;
  return `${daysAgo} days ago`;
};
