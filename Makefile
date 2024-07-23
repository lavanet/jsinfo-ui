run:
	LOGO_URL=https://gateway-fe-public-assets.s3.amazonaws.com/env/LavaLocal.svg INFO_NETWORK=local NEXT_PUBLIC_REST_URL=http://localhost:8081 PORT=5100 pnpm dev

staging_run:
	LOGO_URL=https://gateway-fe-public-assets.s3.amazonaws.com/env/LavaStaging.svg INFO_NETWORK=testnet_local NEXT_PUBLIC_REST_URL=https://jsinfo.lava-cybertron.xyz PORT=5100 pnpm dev

testnet_run:
	LOGO_URL=https://gateway-fe-public-assets.s3.amazonaws.com/env/LavaTestnet.svg INFO_NETWORK=testnet_local NEXT_PUBLIC_REST_URL=https://jsinfo.lavanet.xyz PORT=5100 pnpm dev

mainnet_run:
	LOGO_URL=https://gateway-fe-public-assets.s3.amazonaws.com/env/LavaMainnet.svg INFO_NETWORK=mainnet_local NEXT_PUBLIC_REST_URL=https://jsinfo.mainnet.lavanet.xyz/ PORT=5100 pnpm dev

build:
	INFO_NETWORK=local NEXT_PUBLIC_REST_URL=12 pnpm build

install:
	pnpm install