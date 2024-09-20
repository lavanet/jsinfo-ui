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


