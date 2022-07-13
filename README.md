# discord-tweet-listener
A discord bot that send tweets from specific accounts.

## Note
You have to create `.env` file like the following on the top of the repository.

```.env
DISCORD_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXX
CLIENT_ID=000000000000000000
TWITTER_BEARER_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXXX
REDIS_TLS_URL=rediss://xxxxxxxxxxxxxxxxxxxxxxxx
```
- `DISCORD_TOKEN` : your discord bot token.
- `CLIENT_ID` : your discord bot client id.
- `TWITTER_BEARER_TOKEN` : your twitter bearer token.
- `REDIS_TLS_URL` : url of redis server with TLS.
