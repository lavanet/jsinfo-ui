run:
	REST_URL=http://localhost:8081 PORT=4000 npm run dev

run_nodemon:
	REST_URL=http://localhost:8081 PORT=4000 npm run nodemon

testnet_run:
	REST_URL=https://jsinfo.lavanet.xyz PORT=4000 npm run dev

testnet_run_nodemon:
	REST_URL=https://jsinfo.lavanet.xyz PORT=4000 npm run nodemon