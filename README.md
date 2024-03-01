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
```

### Env

```bash
cat .env.local`
```

```
#REST_URL=https://jsinfo.lavanet.xyz
REST_URL=http://localhost:8081/
```

### Running the project

```
PORT=4000 npm run dev
# checks for changing files
PORT=4000 npm run nodemon
REST_URL=https://jsinfo.lavanet.xyz PORT=4000 npm run nodemon
```
