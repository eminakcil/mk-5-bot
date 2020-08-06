
module.exports = {
	name: 'temizle',
	description: '99 mesaja kadar temizle',
	usage: '<sayı>',
	args: true,
	guildOnly: true,
	execute(message, args) {
		const amount = parseInt(args[0]) + 1

		if (isNaN(amount)) {
			return message.reply('geçerli bir sayı gibi görünmüyor')
		} else if (amount <= 1 || amount > 100) {
			return message.reply('1 ve 99 arasında olmalı')
		}

		message.channel.bulkDelete(amount, true).catch(err => {
			console.error(err)
			message.channel.send('bu kanaldaki mesajları temizlerken bir hata oluştu')
		})
	},
}