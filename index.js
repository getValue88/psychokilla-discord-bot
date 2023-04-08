require('dotenv').config();
const { Client, Intents, MessageEmbed } = require('discord.js');
const schedule = require('node-schedule');

const client = new Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    disableEveryone: false
});

let running = false;

client.on('ready', async () => {
    try {
        console.log(`Logged in as ${client.user.tag}!`);
    } catch (error) {
        console.log(error)
    }
});

client.on('messageCreate', async message => {
    if (message.content === '!bosses' && !running) {
        running = true;
        try {
            const guild = message.guild;
            await message.channel.send(`Mochila mochila`);

            setupBossJob('ALIEN', 'Laberinto Bicheon P4 - Bicheon Labyrinth F4', '45 10 * * *', 1, 60000 * 5, 'NO', 'Alien', guild, message.channel);
            setupBossJob('ALIEN', 'Laberinto Bicheon P4 - Bicheon Labyrinth F4', '45 20 * * *', 3, 60000 * 5, 'NO', 'Alien', guild, message.channel);
            setupBossJob('TORO', 'Laberinto del Toro Endemoniado P4 - Demoniac Bull Labyrinth F4', '48 10 * * *', 2, 60000 * 5, 'NO', 'Toro', guild, message.channel);
            setupBossJob('TORO', 'Laberinto del Toro Endemoniado P4 - Demoniac Bull Labyrinth F4', '48 20 * * *', 3, 60000 * 5, 'NO', 'Toro', guild, message.channel);
            setupBossJob('MONJE', 'Laberinto Serpiente P4 - Snake Pit Labyrinth F4', '51 10 * * *', 5, 60000 * 5, 'NO', 'Toro', guild, message.channel);
            setupBossJob('MONJE', 'Laberinto Serpiente P4 - Snake Pit Labyrinth F4', '51 20 * * *', 5, 60000 * 5, 'NO', 'Monje', guild, message.channel);
        } catch (error) {
            console.log(error);
        }
    }
})

const setupBossJob = (bossName, location, hour, maxReactions, timeLimit, top, voiceChannelName, guild, generalChannel,) => {
    const filter = (reaction, user) => reaction.emoji.name === '👍' && !user.bot;

    schedule.scheduleJob(hour, async () => {
        const voiceChannel = guild.channels.cache.find(ch => ch.name === voiceChannelName);
        let message, party;

        const embedMessage = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`@everyone ${bossName}`)
            .setDescription('React with 👍 to participate')
            .setThumbnail(`attachment://${bossName}.png`)
            .addFields(
                { name: 'LOCATION', value: location },
                { name: 'SLOTS', value: maxReactions.toString(), inline: true },
                { name: 'TOP 20', value: top, inline: true },
            )

        message = await client.channels.cache.get(generalChannel.id).send({
            embeds: [embedMessage], files: [{
                attachment: `images/${bossName}.png`,
                name: `${bossName}.png`
            }]
        });
        await message.react('👍');

        const collector = await message.createReactionCollector({
            filter,
            max: maxReactions,
            time: timeLimit
        });

        collector.on('end', async (collected) => {
            if (!collected.size) {
                message.delete({ timeout: 1000 });
                return;
            }

            party = await collected.get('👍').users.fetch().then(data => data.filter(u => !u.bot));
            if (party) {
                message.delete({ timeout: 1000 });
                const partyEmbedMessage = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`${bossName} PARTY:`)
                    .setDescription(`The following members must enter the ${bossName} boss voice channel before the spwan:\n\n${party.map(u => `${u.toString()}\n`).join('').slice(0, -1)}`)
                    .setThumbnail(`attachment://${bossName}.png`);

                await client.channels.cache.get(generalChannel.id).send({
                    embeds: [partyEmbedMessage], files: [{
                        attachment: `images/${bossName}.png`,
                        name: `${bossName}.png`
                    }]
                    // await party.forEach(u => guild.members.cache.find(mem => mem.user.id === u.id).voice.setChannel(voiceChannel));
                })
            }
        });
    });
}

client.login(process.env.CLIENT_TOKEN);