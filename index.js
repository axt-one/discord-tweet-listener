const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');
const { ETwitterStreamEvent, TweetStream, TwitterApi, ETwitterApiError } = require('twitter-api-v2');
require('dotenv').config();


const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const twitter = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

client.twitterClient = twitter.readOnly.v2;
client.twitterStream = client.twitterClient.searchStream({ autoConnect: false });

client.twitterStream.on(
    ETwitterStreamEvent.Data,
    async data => {
        console.log(data);
        const ids = data.matching_rules.map(data => data.id);
        const url = 'https://twitter.com/twitter/status/' + data.data.id;
        for (const id of ids) {
            console.log(client.searchRules[id]);
            if (!client.searchRules[id]) continue;
            for (const channelId of client.searchRules[id]) {
                await client.channels.cache.get(channelId).send(url);
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

client.twitterStream.connect({ autoReconnect: true, autoReconnectRetries: Infinity })
    .then(() => console.log('connected'))
    .catch(() => console.log('connection failed'));
client.searchRules = {}

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