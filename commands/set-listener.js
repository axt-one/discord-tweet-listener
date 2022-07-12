const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-listener')
        .setDescription('Set a tweet listener that post a tweet from the given username.')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Username of an account monitored by this bot for tweets')
                .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getString('username');
        interaction.client.twitterClient.updateStreamRules({
            add: [
                {
                    value: `from:${user}`,
                    tag: `Tweets from @${user}`
                }
            ]
        })
            .then(result => {
                interaction.reply(`Tweets from @${user} will be forwarded.`);
                const ids = result.data ? result.data.map(data => data.id)
                    : result.errors ? result.errors.map(data => data.id) : [];
                for (const id of ids) {
                    if (!interaction.client.searchRules[id]) interaction.client.searchRules[id] = new Set();
                    interaction.client.searchRules[id].add(interaction.channelId);
                }
            })
            .catch(err => {
                console.log(err);
                interaction.reply('Someting wrong.');
            });
    },
};