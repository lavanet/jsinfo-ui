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
        APT1: "Aptos Mainnet",
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
        POLYGON: "Polygon",
        POLYGONT: "Polygon Testnet",
        ALFAJORES: "Celo Alfajores Testnet",
        BLAST: "Blast",
        FVM: "Filecoin",
        FVMT: "Filecoin Testnet",
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
        ARBITRUM: "Arbitrum",
        ARBITRUMT: "Arbitrum Testnet",
        FUSE: "Fuse",
        SUIT: "Sui",
        COSMOSSDKFULL: "Cosmos SDK Full",
        COSMOSSDK: "Cosmos SDK",
        SQDSUBGRAPH: "Subsquid Subgraphs",
        FTM4002: "Fantom Testnet",
        MORALIS: "Moralis",
        HOL1: "Holochain",
        BERAT2: "Berachain",
        CELESTIA: "Celestia",
        CELESTIAT: "Celestia Testnet",
        CELESTIATM: "Celestia Mocha Testnet",
        KAKAROT: "Kakarot",
        KAKAROTT: "Kakarot Testnet",
        ETHBEACON: "ETH Beacon",
        LAVA: "Lava Network",
        MOVEMENTT: "Movement Testnet",
        MOVEMENT: "Movement",
    };

    return mapping[abbreviation] || "";
}