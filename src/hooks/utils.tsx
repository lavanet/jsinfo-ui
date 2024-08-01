// src/hooks/utils.tsx

export function ValidateDataKey(dataKey: string) {
    const parts = dataKey.split('/');
    // Test the first part (or the whole dataKey if there's no slash)
    if (!parts[0] || parts[0] === "undefined" || parts[0] === "null" || parts[0] === "" || !/^[A-Za-z0-9.]+$/.test(parts[0])) {
        console.error(`Invalid arguments: dataKey=${dataKey}`);
        throw new Error(`Invalid dataKey: ${dataKey}. The first part of dataKey (or the whole dataKey if there's no slash) must be a non-empty string that only contains the characters A-Z, a-z, 0-9, and dot.`);
    }

    if (parts.length > 1) {
        // Test the part after the slash
        const parts1 = parts[1].split('?')[0];
        if (!/^[A-Za-z0-9\@]+$/.test(parts1)) {
            console.error(`Invalid arguments: dataKey=${dataKey}`);
            throw new Error(`Invalid LastUrlPath: ${parts[1]}. The LastUrlPath must match a lava id, starting with 'lava@' or spec id: [A-Za-z0-9]+`);
        }
    }
}
