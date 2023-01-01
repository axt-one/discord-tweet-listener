const { SlashCommandBuilder } = require("@discordjs/builders");
const schedule = require("node-schedule");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reminder")
    .setDescription("Register a reminder.")
    .addStringOption((option) =>
      option
        .setName("date")
        .setDescription("YYYY-MM-DDTHH:mm")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("A message to be sent")
        .setRequired(true)
    ),
  async execute(interaction) {
    const dateString = interaction.options.getString("date");
    const message = interaction.options.getString("message");
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      await interaction.reply("Invalid Time");
    } else {
      const job = schedule.scheduleJob(date, () => {
        interaction.channel.send(message);
      });

      await interaction.reply("ok");
    }
  },
};
