# Fab.Crawler

## Install (simple version)
To simplify the setup everything is packed into docker compose. Run the command to build images and run the crawler:

```
docker-compose up --build
```

## Install (long version)

```
npm install
```
edit `.env` file and set your own credentials.
```
AWS_ACCESS_KEY_ID=XXXX
AWS_SECRET_ACCESS_KEY=XXX
S3_BUCKET=fab.crawler
POSTGRESQL_URL=postgres://postgres@db/fab.crawler
```

then run:
```
node index.js --csv app/import.example.csv
```
