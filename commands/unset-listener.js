const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unset-listener')
        .setDescription('Unset a tweet listener')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Username of an account monitored by this bot for tweets')
                .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getString('username');
        const rules = await interaction.client.twitterClient.streamRules();
        if (!rules.data) {
            interaction.reply(`Listener for @${user} is not set.`);
            return;
        }

        const index = rules.data.map(data => data.value).indexOf(`from:${user}`);
        if (index == -1) {
            interaction.reply(`Listener for @${user} is not set.`);
            return;
        }
        const id = rules.data[index].id;
        const searchRules = JSON.parse(
            await interaction.client.redis.get('searchRules'));
        if (searchRules[id]) {
            searchRules[id] = searchRules[id].filter(ch => ch !== interaction.channelId);
            await interaction.client.redis.set('searchRules', JSON.stringify(searchRules));
            if (searchRules[id].length) {
                interaction.reply('Success!');
                return;
            }
        }

        interaction.client.twitterClient.updateStreamRules({
            delete: {
                ids: [id]
            }
        })
            .then(res => {
                console.log(res);
                interaction.reply('Success!');
            })
            .catch(err => {
                console.log(err);
                interaction.reply('Someting wrong.');
            });
    },
};