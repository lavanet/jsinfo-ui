### Oveview 

The web-ui for the json info project, previously named lavainfo.

### Hosting

jsinfo-ui is hosted on:
```
https://jsinfo-ui.vercel.app/
```

jsinfo is hosted on:
```
# testnet
https://jsinfo.lavanet.xyz/spec/eth1
# staging
https://jsinfo.lava-cybertron.xyz/latest
```

### Env

cat `.env.local`
```
#REST_URL=https://jsinfo.lavanet.xyz
REST_URL=http://localhost:3000/
```

### Running the project

```
PORT=4000 npm run dev
# checks for changing files
PORT=4000 npm run nodemon
```
