const {
    MessageType,
    WAMessage,
    ReconnectMode,
    WAProto,
    useSingleFileAuthState,
    MediaType,
    MessageOptions,
    Mimetype,
    DisconnectReason,
    downloadContentFromMessage
} = require('@adiwajshing/baileys')
var pino = require("pino");
var makeWASocket = require("@adiwajshing/baileys");
//const axios = require('axios').default
const fs = require('fs')
const moment = require('moment-timezone')
const chalk = require('chalk')
const CFonts = require('cfonts')
const express = require('express');
const {
    Sticker,
    createSticker,
    StickerTypes
} = require('wa-sticker-formatter')

const app = express();

app.get("/", (request, response) => {

    const ping = new Date();
    ping.setHours(ping.getHours() - 3);
    console.log(`Ping recebido às ${ping.getUTCHours()}:${ping.getUTCMinutes()}:${ping.getUTCSeconds()}`)
    response.send(`Ping recebido às ${ping.getUTCHours()}:${ping.getUTCMinutes()}:${ping.getUTCSeconds()}`);

});
app.listen(process.env.PORT);


const {
    help
} = require('./database/menu/help')
const {
    criador
} = require('./database/menu/criador')
const {
    faq
} = require('./database/menu/faq')
const {
    pix_txt
} = require('./database/menu/pix')
const option = JSON.parse(fs.readFileSync('./options/option.json'))

const {
    botName,
    ownerName,
    ownerNumber,
    pix
} = option

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`
}

const {
    saveState,
    state
} = useSingleFileAuthState('./database/auth.json');



(async () => {
    CFonts.say('Nyx', {
        font: 'block',
        align: 'center',
        gradient: ['green', 'magenta']
    })
    CFonts.say('Bot', {
        font: 'block',
        align: 'center',
        gradient: ['green', 'magenta']
    })
    CFonts.say('Por @ny.lucax', {
        font: 'console',
        align: 'center',
        gradient: ['red', 'magenta']
    })

    prefix = [
        '$'
    ]
    var nyx = undefined;

    var startSock = () => {
        const nyx = makeWASocket["default"]({
            printQRInTerminal: true,
            browser: ['NyxBot Multi-Device', "Safari", "3.0"],
            logger: pino({
                level: 'warn'
            }),
            auth: state
        })


        nyx.ev.on('messages.upsert', async m => {
            try {
                const msg = m.messages[0]
                if (!msg.message) return
                msg.message = (Object.keys(msg.message)[0] === 'ephemeralMessage') ? msg.message.ephemeralMessage.message: msg.message
                if (!msg.message) return
                if (msg.key && msg.key.remoteJid == 'status@broadcast') return
                if (msg.key.fromMe) return
                global.prefix

                const from = msg.key.remoteJid
                const type = Object.keys(msg.message)[0]
                const time = moment.tz('America/Sao_Paulo').format('HH:mm:ss')

                var body = (type === 'conversation') ? msg.message.conversation: (type == 'imageMessage') ?
                msg.message.imageMessage.caption: (type == 'videoMessage') ?
                msg.message.videoMessage.caption: (type == 'extendedTextMessage') ?
                msg.message.extendedTextMessage.text: (type == 'messageContextInfo') || (type == 'buttonsResponseMessage') ?
                msg.message.buttonsResponseMessage.selectedButtonId: (type == 'templateButtonReplyMessage') ?
                msg.message.templateButtonReplyMessage.selectedId: (type == 'listResponseMessage') ?
                msg.message.listResponseMessage.singleSelectReply.selectedRowId: ''

                const isCmd = body.startsWith(prefix)
                const command = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase()
                const args = body.trim().split(/ +/).slice(1)
                const isGroup = from.endsWith('@g.us')
                const getNumber = from.split('@')[0]

                const pushname = msg.pushName || "Sem Nome"

                const groupMetadata = isGroup ? await nyx.groupMetadata(from): ''
                const groupName = isGroup ? groupMetadata.subject: 'Indefinido'

                const isMedia = type.includes('videoMessage') || type.includes('imageMessage') || type.includes('stickerMessage') || type.includes('audioMessage') || type.includes('documentMessage')
                const isVideo = type.includes('videoMessage')
                const isImage = type.includes('imageMessage')

                const reply = (mensagem) => {
                    nyx.sendMessage(from, {
                        text: mensagem
                    });
                }
                const idGroup = "120363022500677457@g.us"
                const gruopLogs = (mensagem) => {

                    nyx.sendMessage(idGroup, {
                        text: mensagem
                    });
                }

                if (isCmd) {

                    gruopLogs(`[ *LOG* ] \n\nComando: $${command} \nPor: ${getNumber}(${pushname}).\nGrupo: ${groupName}.`)

                }

                function reaction(emoji) {

                    const reactionEmoji = {
                        react: {
                            text: emoji,
                            key: msg.key
                        }
                    }
                    nyx.sendMessage(from, reactionEmoji)

                }

                if (!isGroup && !isMedia && !isCmd) {

                    const buttonsAjuda = [{
                        index: 1,
                        urlButton: {
                            displayText: 'Instagram',
                            url: 'https://Instagram.com/nyxbot_'
                        }},
                        {
                            index: 2,
                            quickReplyButton: {
                                displayText: '❔AJUDA',
                                id: '$ajuda'
                            }},
                        {
                            index: 3,
                            quickReplyButton: {
                                displayText: '🌃 ADESIVOS',
                                id: '$sticker'
                            }},
                        {
                            index: 4,
                            quickReplyButton: {
                                displayText: '⏭️ PRÓXIMA PÁGINA',
                                id: '$nextpage'
                            }}]

                    const ajuda = {
                        image: {
                            url: "./database/media/help.jpg"
                        },
                        text: "\nEstou aqui para facilitar a criação de adesivos para WhatsApp, sem precisar de sair do próprio WhatsApp!\n\nConsigo atuar em grupos ou em conversas privadas!\n\nE além de conseguir fazer os adesivos convencionais, também sou capaz de fazer adesivos animados.\n\nPara começar, basta clicar em algumas das seguintes opções:",
                        templateButtons: buttonsAjuda,
                        headerType: 4
                    }
                    nyx.sendMessage(from, ajuda)

                }

                //debug option
                //console.log(type)

                switch (command) {

                    case 'ping':

                        reaction("😔")

                        break

                    case 'ajuda':

                        const buttonsHelp = [{
                            index: 1,
                            urlButton: {
                                displayText: 'Instagram',
                                url: 'https://Instagram.com/nyxbot_'
                            }},
                            {
                                index: 2,
                                quickReplyButton: {
                                    displayText: '❔AJUDA',
                                    id: '$ajuda'
                                }},
                            {
                                index: 3,
                                quickReplyButton: {
                                    displayText: '🌃 ADESIVOS',
                                    id: '$sticker'
                                }},
                            {
                                index: 4,
                                quickReplyButton: {
                                    displayText: '⏭️ PRÓXIMA PÁGINA',
                                    id: '$nextpage'
                                }}]

                        const help = {
                            image: {
                                url: "./database/media/help.jpg"
                            },
                            text: "\nEstou aqui para facilitar a criação de adesivos para WhatsApp, sem precisar de sair do próprio WhatsApp!\n\nConsigo atuar em grupos ou em conversas privadas!\n\nE além de conseguir fazer os adesivos convencionais, também sou capaz de fazer adesivos animados.\n\nPara começar, basta clicar em algumas das seguintes opções:",
                            templateButtons: buttonsHelp,
                            headerType: 4
                        }
                        nyx.sendMessage(from, help)

                        break

                    case 'nextpage':

                        const buttonsNextPage = [{
                            index: 1,
                            urlButton: {
                                displayText: 'Instagram',
                                url: 'https://Instagram.com/nyxbot_'
                            }},
                            {
                                index: 2,
                                quickReplyButton: {
                                    displayText: '📃PERGUNTAS FREQUENTES',
                                    id: '$faq'
                                }},
                            {
                                index: 3,
                                quickReplyButton: {
                                    displayText: '💰 DOAÇÕES',
                                    id: '$doação'
                                }},
                            {
                                index: 4,
                                quickReplyButton: {
                                    displayText: '📄 INFORMAÇÕES',
                                    id: '$info'
                                }}]

                        const nextpage = {
                            image: {
                                url: "./database/media/help.jpg"
                            },
                            text: "\nEstou aqui para facilitar a criação de adesivos para WhatsApp, sem precisar de sair do próprio WhatsApp!\n\nConsigo atuar em grupos ou em conversas privadas!\n\nE além de conseguir fazer os adesivos convencionais, também sou capaz de fazer adesivos animados.\n\nPara começar, basta clicar em algumas das seguintes opções:",
                            templateButtons: buttonsNextPage,
                            headerType: 4
                        }
                        nyx.sendMessage(from, nextpage)

                        break

                    case 'info':

                        const buttonsInfo = [{
                            index: 1,
                            urlButton: {
                                displayText: 'Instagram',
                                url: 'https://Instagram.com/nyxbot_'
                            }},
                            {
                                index: 2,
                                quickReplyButton: {
                                    displayText: '💰 DOAÇÕES',
                                    id: '$doação'
                                }}]

                        const info = {
                            text: `${criador(pushname, botName, ownerName)}`,
                            templateButtons: buttonsInfo
                        }
                        nyx.sendMessage(from, info)

                        break

                    case 'faq':

                        const buttonsFaq = [{
                            index: 1,
                            urlButton: {
                                displayText: 'Instagram',
                                url: 'https://Instagram.com/nyxbot_'
                            }},
                        ]

                        const faqs = {
                            text: `${faq(pushname)}`,
                            templateButtons: buttonsFaq
                        }
                        nyx.sendMessage(from, faqs)


                        break

                    case 'doação':

                        nyx.sendMessage(from, {
                            text: pix_txt(pushname, botName, ownerName)})
                        await sleep(300)
                        reply("Chave Aleatória:")
                        await sleep(300)
                        reply(`${pix}`)

                        break

                    case 'adesivo':
                        case 'sticker':

                            if (!isGroup) {

                                reply(`Olá ${pushname}\n\nVocê sabia que em conversas privadas não precisa adicionar ($sticker) na descrição da mídia?\n\nBasta você enviar apenas a mídia que Imediatamente iremos reconhecer sua requisição!`)

                            }

                            if (!isMedia) {

                                reply(`Olá ${pushname}!\n\nEstá tentando criar um adesivo?\n\nEstamos com um novo sistema de adesivos, em chats privados você pode apenas enviar a imagem, vídeo ou gif, que iremos processar sua requisição imediatamente.\n\nJá em grupos, você deve adicionar $sticker ou $adesivos na legenda do arquivo para que possamos reconhecer sua requisição.`)

                            }

                            if (isMedia && isImage) {

                                const stream = await downloadContentFromMessage(msg.message.imageMessage, 'image')
                                reply('Iniciando Requisição...')

                                let buffer = Buffer.from([]);

                                for await(const chunk of stream) {
                                    buffer = Buffer.concat([buffer, chunk]);
                                }
                                const media = `./${getNumber}.jpeg`
                                // save to file
                                fs.writeFileSync(media, buffer)

                                const sticker = new Sticker(`./${getNumber}.jpeg`, {
                                    pack: pushname, // The pack name
                                    author: '@nyxbot_', // The author name
                                    type: StickerTypes.FULL, // The sticker typeg
                                    categories: ['🤩', '🎉'], // The sticker category
                                    id: `${getNumber}`, // The sticker id
                                    quality: 10, // The quality of the output file
                                    background: '#00000000' // The sticker background color (only for full stickers)
                                })

                                const save = await sticker.toBuffer() // convert to buffer

                                await sticker.toFile(`${getNumber}.webp`)

                                nyx.sendMessage(from, {
                                    sticker: {
                                        url: getNumber + ".webp"
                                    }})
                                reaction("✅")

                                try {

                                    fs.unlinkSync(getNumber + ".jpeg");
                                    await sleep(500)
                                    fs.unlinkSync(getNumber + ".webp");

                                } catch (error) {
                                    reply("😵 Calma aí, não consigo processar tudo isso ao mesmo tempo, vamos com calma!")
                                    reaction("😵")
                                }

                            }
                            if (isMedia && isVideo && msg.message.videoMessage.seconds > 9) {

                                reply('Indentificamos que o tamanho do vídeo requisitado é muito grande, mande no máximo um vídeo de nove segundos para que possamos reconhecê-lo!')
                                reaction("❌")

                            } else if (isMedia && isVideo && msg.message.videoMessage.seconds < 10) {

                                const stream = await downloadContentFromMessage(msg.message.videoMessage, 'video')

                                const buttonUrl = [{
                                    index: 1,
                                    urlButton: {
                                        displayText: 'Instagram',
                                        url: 'https://Instagram.com/nyxbot_'
                                    }},
                                ]

                                const buttonMessage = {
                                    text: `\nIniciando Requisição...\n\nEsse processo costuma demora, por favor tenha paciência.\nEnquanto isso, visite nosso Instagram:`,
                                    templateButtons: buttonUrl
                                }

                                nyx.sendMessage(from, buttonMessage)

                                let buffers = Buffer.from([]);

                                for await(const chunk of stream) {
                                    buffers = Buffer.concat([buffers, chunk]);
                                }
                                const mediaa = `./${getNumber}.mp4`
                                // save to file
                                fs.writeFileSync(mediaa, buffers)

                                const sticker = new Sticker(`./${getNumber}.mp4`, {
                                    pack: pushname, // The pack name
                                    author: '@nyxbot_', // The author name
                                    type: StickerTypes.FULL, // The sticker typeg
                                    categories: ['🤩', '🎉'], // The sticker category
                                    id: `${getNumber}`, // The sticker id
                                    quality: 10, // The quality of the output file
                                    background: '#00000000' // The sticker background color (only for full stickers)
                                })

                                const save = await sticker.toBuffer() // convert to buffer

                                await sticker.toFile(`${getNumber}.webp`)

                                nyx.sendMessage(from, {
                                    sticker: {
                                        url: getNumber + ".webp"
                                    }})
                                reaction("✅")

                                try {

                                    fs.unlinkSync(getNumber + ".mp4");
                                    await sleep(500)
                                    fs.unlinkSync(getNumber + ".webp");

                                } catch (error) {
                                    reply("😵 Calma aí, não consigo processar tudo isso ao mesmo tempo, vamos com calma!")
                                    reaction("😵")
                                }

                            }


                            break
                        case '':

                            if (!isGroup) {

                                if (isMedia && isImage) {

                                    const stream = await downloadContentFromMessage(msg.message.imageMessage, 'image')
                                    reply('Iniciando Requisição...')

                                    let buffer = Buffer.from([]);

                                    for await(const chunk of stream) {
                                        buffer = Buffer.concat([buffer, chunk]);
                                    }
                                    const media = `./${getNumber}.jpeg`
                                    // save to file
                                    fs.writeFileSync(media, buffer)

                                    const sticker = new Sticker(`./${getNumber}.jpeg`, {
                                        pack: pushname, // The pack name
                                        author: '@nyxbot_', // The author name
                                        type: StickerTypes.FULL, // The sticker typeg
                                        categories: ['🤩', '🎉'], // The sticker category
                                        id: `${getNumber}`, // The sticker id
                                        quality: 10, // The quality of the output file
                                        background: '#00000000' // The sticker background color (only for full stickers)
                                    })

                                    const save = await sticker.toBuffer() // convert to buffer

                                    await sticker.toFile(`${getNumber}.webp`)

                                    nyx.sendMessage(from, {
                                        sticker: {
                                            url: getNumber + ".webp"
                                        }})
                                    reaction("✅")

                                    try {

                                        fs.unlinkSync(getNumber + ".jpeg");
                                        await sleep(500)
                                        fs.unlinkSync(getNumber + ".webp");

                                    } catch (error) {
                                        reply("😵 Calma aí, não consigo processar tudo isso ao mesmo tempo, vamos com calma!")
                                        reaction("😵")
                                    }

                                }
                                if (isMedia && isVideo && msg.message.videoMessage.seconds > 9) {

                                    reply('Indentificamos que o tamanho do vídeo requisitado é muito grande, mande no máximo um vídeo de nove segundos para que possamos reconhecê-lo!')
                                    reaction("❌")

                                } else if (isMedia && isVideo && msg.message.videoMessage.seconds < 10) {

                                    const stream = await downloadContentFromMessage(msg.message.videoMessage, 'video')

                                    const buttonUrl = [{
                                        index: 1,
                                        urlButton: {
                                            displayText: 'Instagram',
                                            url: 'https://Instagram.com/nyxbot_'
                                        }},
                                    ]

                                    const buttonMessage = {
                                        text: `\nIniciando Requisição...\n\nEsse processo costuma demora, por favor tenha paciência.\nEnquanto isso, visite nosso Instagram:`,
                                        templateButtons: buttonUrl
                                    }

                                    nyx.sendMessage(from, buttonMessage)

                                    let buffers = Buffer.from([]);

                                    for await(const chunk of stream) {
                                        buffers = Buffer.concat([buffers, chunk]);
                                    }
                                    const mediaa = `./${getNumber}.mp4`
                                    // save to file
                                    fs.writeFileSync(mediaa, buffers)

                                    const sticker = new Sticker(`./${getNumber}.mp4`, {
                                        pack: pushname, // The pack name
                                        author: '@nyxbot_', // The author name
                                        type: StickerTypes.FULL, // The sticker typeg
                                        categories: ['🤩', '🎉'], // The sticker category
                                        id: `${getNumber}`, // The sticker id
                                        quality: 10, // The quality of the output file
                                        background: '#00000000' // The sticker background color (only for full stickers)
                                    })

                                    const save = await sticker.toBuffer() // convert to buffer

                                    await sticker.toFile(`${getNumber}.webp`)

                                    nyx.sendMessage(from, {
                                        sticker: {
                                            url: getNumber + ".webp"
                                        }})
                                    reaction("✅")

                                    try {

                                        fs.unlinkSync(getNumber + ".mp4");
                                        await sleep(500)
                                        fs.unlinkSync(getNumber + ".webp");

                                    } catch (error) {
                                        reply("😵 Calma aí, não consigo processar tudo isso ao mesmo tempo, vamos com calma!")
                                        reaction("😵")
                                    }

                                }
                            }
                            break

                }

            } catch (err) {
                console.log(err)
            }
        })
        nyx.ev.on('group-participants.update',
            async (update) => {
                try {
                    console.log(update)
                } catch (error) {
                    console.log(error)
                }
            })
        return nyx
    }

    nyx = startSock()
    nyx.ev.on('connection.update',
        async (update) =>
        {
            const {
                connection,
                lastDisconnect
            } = update

            if (connection === 'close') {

                const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
                lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut ? startSock(): console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            }

            console.log('Update', update)

        })

    // Esculta e atualizar as credências no arquivo auth.json
    nyx.ev.on('creds.update',
        saveState);

    return nyx;


})()