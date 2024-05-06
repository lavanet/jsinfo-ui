run:
	NEXT_PUBLIC_REST_URL=http://localhost:8081 PORT=4000 pnpm dev

testnet_run:
	NEXT_PUBLIC_REST_URL=https://jsinfo.lavanet.xyz PORT=4000 pnpm dev

build_run:
    NEXT_PUBLIC_REST_URL=https://jsinfo.lavanet.xyz PORT=4000 pnpm build && pnpm start