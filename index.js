const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');
const { ETwitterStreamEvent, TwitterApi } = require('twitter-api-v2');
const Redis = require("ioredis");
require('dotenv').config();


const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const twitter = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
const redis = new Redis({
    host: process.env.REDIS_HOST, 
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD 
});

client.redis = redis;
client.twitterClient = twitter.readOnly.v2;
client.twitterStream = client.twitterClient.searchStream({
    autoConnect: false,
    expansions: ['referenced_tweets.id', 'author_id']
});

function getOriginalTweetId(data) {
    if (data.referenced_tweets && data.referenced_tweets[0].type === 'retweeted') {
        return {
            originalId: data.referenced_tweets[0].id,
            retweeted: true
        };
    } else {
        return {
            originalId: data.id,
            retweeted: false
        };
    }
}

client.twitterStream.on(
    ETwitterStreamEvent.Data,
    async data => {
        console.log(data);
        const ids = data.matching_rules.map(data => data.id);
        const { originalId, retweeted } = getOriginalTweetId(data.data);
        const url = 'https://twitter.com/twitter/status/' + originalId;
        const searchRules = JSON.parse(await client.redis.get('searchRules'));
        for (const id of ids) {
            console.log(searchRules[id]);
            if (!searchRules[id]) continue;
            for (const channelId of searchRules[id]) {
                if (retweeted) {
                    await client.channels.cache.get(channelId).send(
                        `${data.includes.users[0].name}  Retweeted\n${url}`);
                } else {
                    await client.channels.cache.get(channelId).send(
                        `${data.includes.users[0].name}  Tweeted\n${url}`);
                }
            }
        }
    });
client.twitterStream.on(
    ETwitterStreamEvent.Connected,
    () => console.log('Stream is started.'));
client.twitterStream.on(
    ETwitterStreamEvent.ConnectError,
    err => {
        console.log('Connect error!', err);
        // setTimeout(() => {
        //     client.twitterStream.connect({ autoReconnect: true, autoReconnectRetries: Infinity })
        //         .then(() => console.log('connected'))
        //         .catch(() => console.log('connection failed'));
        // }, 3000);
    });
client.twitterStream.on(
    ETwitterStreamEvent.ConnectionError,
    err => console.log('Connection error!', err));
client.twitterStream.on(
    ETwitterStreamEvent.ConnectionClosed,
    () => console.log('Connection has been closed.'));


async function redisTwitterConnect() {
    if (!await client.redis.exists('searchRules')) {
        await client.redis.set('searchRules', JSON.stringify({})).catch(console.log);
    }

    await client.twitterStream.connect({ autoReconnect: true, autoReconnectRetries: Infinity })
        .catch(() => console.log('connection failed'));
}

redisTwitterConnect();

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}


client.login(process.env.DISCORD_TOKEN);
