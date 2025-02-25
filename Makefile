run:
	@export NEXT_PUBLIC_LOGO_URL=https://gateway-fe-public-assets.s3.amazonaws.com/env/LavaLocal.svg && \
	export NEXT_PUBLIC_INFO_NETWORK=mainnet && \
	export NEXT_PUBLIC_REST_URL=http://localhost:8081 && \
	export PORT=5100 && \
	pnpm dev

testnet_run:
	@export NEXT_PUBLIC_LOGO_URL=https://gateway-fe-public-assets.s3.amazonaws.com/env/LavaTestnet.svg && \
	export NEXT_PUBLIC_INFO_NETWORK=testnet && \
	export NEXT_PUBLIC_REST_URL=https://jsinfo.lavanet.xyz && \
	export PORT=5100 && \
	pnpm dev

mainnet_run:
	@export NEXT_PUBLIC_LOGO_URL=https://gateway-fe-public-assets.s3.amazonaws.com/env/LavaMainnet.svg && \
	export NEXT_PUBLIC_INFO_NETWORK=mainnet && \
	export NEXT_PUBLIC_REST_URL=https://jsinfo.mainnet.lavanet.xyz/ && \
	export PORT=5100 && \
	pnpm dev

build:
	NEXT_PUBLIC_LOGO_URL=nothing NEXT_PUBLIC_INFO_NETWORK=local NEXT_PUBLIC_REST_URL=12 pnpm build

install:
	pnpm install

macos_kill:
	lsof -ti:5100 | xargs kill -9