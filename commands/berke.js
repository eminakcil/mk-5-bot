const { VoiceChannel } = require("discord.js");
const fs = require('fs');

const queue = new Map();


module.exports = {
  name: 'berke',
  description: 'berkenin eşsiz sesinin keyfini çıkart ',
  usage: '',
  args: false,
  guildOnly: true,
  async execute(message, args) {
    const serverQueue = queue.get(message.guild.id);

    //ses kanalı değişkeni
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.channel.send(
        "Berkeyi çalmak için ses kanalında olmanız gerekir!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "Ses kanalınıza katılmak ve konuşmak için izinlere ihtiyacım var!"
      );
    }

    const voiceFiles = fs.readdirSync('./voices').filter(file => file.endsWith('.mp3'))
    const voiceFile = voiceFiles[args[0]]

    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        voices: [],
        volume: 5,
        playing: true
      };

      queue.set(message.guild.id, queueContruct);
      queueContruct.voices.push(voiceFile);

      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.voices[0]);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.voices.push(voiceFile);
      return message.channel.send(`**${voiceFile}** sıraya eklendi`);
    }
  },
}


function play(guild, voice) {
  const serverQueue = queue.get(guild.id);
  if (!voice) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(fs.createReadStream(`./voices/${voice}`))
    .on("finish", () => {
      serverQueue.voices.shift();
      play(guild, serverQueue.voices[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`**${voice}** oynatılıyor`);
}
