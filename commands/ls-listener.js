const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ls-listener')
        .setDescription('Show all listener in this channel.'),
    async execute(interaction) {
        const rules = await interaction.client.twitterClient.streamRules();
        const searchRules = JSON.parse(
            await interaction.client.redis.get('searchRules'));
        // TODO: maybe it is easier to implement with inverted index.
        const ids = new Set(Object.keys(searchRules).filter(key =>
            searchRules[key].includes(interaction.channelId)
        ));
        if (!rules.data) {
            await interaction.reply('No listener is set.');
            return;
        }

        const users = rules.data
            .filter(data => ids.has(data.id))
            .map(data => '@' + data.value.replace('from:', ''));

        if (!users.length) {
            await interaction.reply('No listener is set.');
            return;
        }

        await interaction.reply(users.join('\n'));
    },
};