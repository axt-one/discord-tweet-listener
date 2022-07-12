const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ls-listener')
        .setDescription('Show all listener in this channel.'),
    async execute(interaction) {
        const rules = await interaction.client.twitterClient.streamRules();
        const channels = interaction.client.searchRules;
        const ids = new Set(Object.keys(channels).filter(key =>
            channels[key].has(interaction.channelId)
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