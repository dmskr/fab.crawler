# Fab.Crawler

## Install (simple version)
To simplify the setup everything is packed into docker compose. Run the command to build images and run the crawler:

```
git clone git@github.com:dmskr/fab.crawler.git
cd fab.crawler
docker-compose up --build
```
Docker compose might need a restart when running first time due to postgres initialization not being finished in time. This is known issue intentially ignored for the project as production grade systems should be deployed another way.

## Install (long version)

```
git clone git@github.com:dmskr/fab.crawler.git
cd fab.crawler
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

## Uninstall
```
docker-compose down -v --rmi all --remove-orphans
```
