const { SlashCommandBuilder } = require("@discordjs/builders");
const schedule = require("node-schedule");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reminder")
    .setDescription("Register a reminder.")
    .addStringOption((option) =>
      option
        .setName("date")
        .setDescription("YYYY:MM:DD:HH:mm")
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
    const date = new Date(...dateString.split(":"));
    const job = schedule.scheduleJob(date, () => {
      interaction.channel.send("hello");
    });

    await interaction.reply("ok");
  },
};
