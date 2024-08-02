// src/common/convertors.tsx

export function EventTypeToString(evtType: number) {
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
        case 16:
            return "Delegation To Provider";
        case 17:
            return "Subscription Expired";
        case 18:
            return "Freeze From Unbond";
        case 19:
            return "Ubnond From Provider";
        case 20:
            return "Unstake From Unbound";
        case 21:
            return "Redelegate Between Providers";
        case 22:
            return "Provider Bonus Rewards";
        case 23:
            return "Validtor Slash";
        case 24:
            return "IPRPC Pool Emission";
        case 25:
            return "Distribution Pools Refill";
        case 26:
            return "Provider Temporary Jailed";
        case 27:
            return "Delegator Claimed Rewards";
        case 28:
            return "Set Subscription Policy Event";
        default:
            return "Unknown Event Type";
    }
}

export function StatusToString(status: number) {
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

export function GeoLocationToString(geo: number) {
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


export function ConvertToChainName(abbreviation: string): string {
    if (typeof abbreviation !== 'string') {
        return '';
    }

    const mapping: Record<string, string> = {
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
        OSMOSIS: "Osmosis",
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
        OSMOSIST: "Osmosis Testnet",
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
        BLASTSP: "Blast Special",
        COS5T: "Cosmos Hub Testnet",
        COSMOSHUB: "Cosmos Hub",
        COSMOSHUBT: "Cosmos Hub Testnet",
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