if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const fs = require('fs')
const Discord = require('discord.js')
const { prefix } = require('./config.json')

const client = new Discord.Client()
client.commands = new Discord.Collection()

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  client.commands.set(command.name, command)
}

client.on('ready', () => {
  console.log('Hazırım!')
})

client.on('message', message => {
  const member = message.guild.member(message.member.user)
  if (!message.content.startsWith(prefix) || message.author.bot) return
  const args = message.content.slice(prefix.length).split(/ +/)
  const commandName = args.shift().toLowerCase()

  if (!client.commands.has(commandName)) return

  const command = client.commands.get(commandName)
  
  // if (!member.roles.cache.some(r=>command.access.includes(r.id))) {
  //   message.channel.send("bu komutu kullanamıyorsun gibi gözüküyor!")
  //   return
  // }
  
  
  if (command.args && !args.length) {
    let reply = `Hiç argüman girmedin, ${message.author}!`
    if (command.usage) {
      reply += `\nUygun kullanım: \`${prefix}${command.name} ${command.usage}\``
    }
    return message.channel.send(reply)
  }

  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply('Sadece sunucuda çalışan komut.')
  }

  try {
    console.log(`> ${member.displayName} called ${command.name} "${message.content}"`);
    command.execute(message, args)
  } catch (error) {
    console.error(error)
    message.reply('komut çalıştırılırken hata oluştu!')
  }

})

client.on('guildMemberAdd', (member) => {
  //yeni gelen üyeler
})

client.login(process.env.DC_TOKEN)