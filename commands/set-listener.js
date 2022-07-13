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
            .then(async result => {
                interaction.reply(`Tweets from @${user} will be forwarded.`);
                const ids = result.data ? result.data.map(data => data.id)
                    : result.errors ? result.errors.map(data => data.id) : [];
                const searchRules = JSON.parse(
                    await interaction.client.redis.get('searchRules'));
                for (const id of ids) {
                    // If searchRules[id] is undefined, channelSet will be an empty set.
                    const channelSet = new Set(searchRules[id]);
                    channelSet.add(interaction.channelId);
                    searchRules[id] = [...channelSet];
                }
                await interaction.client.redis.set('searchRules', JSON.stringify(searchRules));
            })
            .catch(err => {
                console.log(err);
                interaction.reply('Someting wrong.');
            });
    },
};