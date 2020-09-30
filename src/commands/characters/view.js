'use babel';
'use strict';

import { Command, CommandFormatError } from 'discord-graf';
import Character from '../../database/character';
import { RichEmbed } from 'discord.js';

export default class ViewCharacterCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'character',
			aliases: ['view-character', 'show-character', 'char'],
			module: 'characters',
			memberName: 'view',
			description: 'Views a character\'s information.',
			usage: 'character <name>',
			details: 'The name can be the whole name of the character, or just a part of it.',
			examples: ['character Billy McBillface', 'character bill'],
			guildOnly: true
		});
	}

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.guild);
		const characters = await Character.findInGuild(message.guild, args[0]);
		if(characters.length === 1) {
			let ownerName;
			try {
				const owner = await message.client.fetchUser(characters[0].owner);
				ownerName = `${owner.username}#${owner.discriminator}`;
				try {
					const member = await message.guild.fetchMember(owner);
					if(member.nickname) ownerName = `${member.nickname} (${ownerName})`;
				} catch(err2) {
					// do nothing
				}
				ownerName = this.bot.util.escapeMarkdown(ownerName);
			} catch(err) {
				ownerName = 'Unknown';
			}
			let tags;
			if(characters[0].tags) {
				tags = characters[0].tags.substring(1, characters[0].tags.length - 1);
			} else {
				tags = '';
			}
			if(`Character **${characters[0].name}** (created by ${ownerName}):\n${characters[0].info}\n\nTags:${tags}` === null) {
				tags = '';
			}
			let embed;
			embed = new RichEmbed()
				// .setColor('#0099ff')
				.setTitle('Character: **${characters[0].name}**')
				// .setURL('https://discord.js.org/')
				.setAuthor('Created by: ${ownerName}')
				.setDescription('${characters[0].info}')
				// .setThumbnail('https://i.imgur.com/wSTFkRM.png')
				// .addFields(
				//	{ name: 'Regular field title', value: 'Some value here' },
				//	{ name: '\u200B', value: '\u200B' },
				//	{ name: 'Inline field title', value: 'Some value here', inline: true },
				//	{ name: 'Inline field title', value: 'Some value here', inline: true },
				// )
				// .addField('Inline field title', 'Some value here', true)
				// .setImage('https://i.imgur.com/wSTFkRM.png')
				.setTimestamp()
				.setFooter('Tags:${tags}');

			return embed;
			// return `Character **${characters[0].name}** (created by ${ownerName}):\n${characters[0].info}\n\nTags:${tags}`;
		} else if(characters.length > 1) {
			return this.bot.util.disambiguation(characters, 'characters');
		} else {
			return `Unable to find character. Use ${this.bot.util.usage('characters', message.guild)} to view the list of characters.`;
		}
	}
}
