run:
	NEXT_PUBLIC_REST_URL=http://localhost:8081 PORT=5100 pnpm dev

testnet_run:
	NEXT_PUBLIC_REST_URL=https://jsinfo.lavanet.xyz PORT=5100 pnpm dev

mainnet_run:
	NEXT_PUBLIC_REST_URL=https://jsinfo.mainnet.lavanet.xyz/ PORT=5100 pnpm dev

build:
	NEXT_PUBLIC_REST_URL=12 pnpm build