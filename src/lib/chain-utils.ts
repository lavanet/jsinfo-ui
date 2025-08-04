// Helper function to get display name for chain
// Handles special cases like BSC -> BNB
export function getChainMaybeReplacedShortName(chainId: string): string {
    if (!chainId) return '';
    
    // Simple string replacement: BSC -> BNB
    if (chainId === 'BSC') return 'BNB';
    if (chainId === 'BSCT') return 'BNBT';
    
    // Also handle lowercase
    if (chainId === 'bsc') return 'bnb';
    if (chainId === 'bsct') return 'bnbt';
    
    // Return original for all other chains
    return chainId;
}