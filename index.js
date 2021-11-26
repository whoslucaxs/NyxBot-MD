
const {
    MessageType,
    WAMessage,
    ReconnectMode,
    WAProto,
    useSingleFileAuthState,
    MediaType,
    DisconnectReason
} = require('@adiwajshing/baileys-md')
var pino = require("pino");
var baileys = require("@adiwajshing/baileys-md");
const axios = require('axios').default
const fs = require('fs')
const moment = require('moment-timezone')
const chalk = require('chalk')
const CFonts  = require('cfonts')

const { saveState, state } = useSingleFileAuthState('./session.json');


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
    CFonts.say('---------------------------- LOGS ----------------------------', {
    font: 'console',
    align: 'center',
    gradient: ['red', 'magenta']
    })
    prefix = [
        '$'
    ]
    var client = undefined;
	
    var startSock = () => {
        const client = baileys["default"]({
            printQRInTerminal: true,
            browser: ['NyxBot Multi-Device', "Safari", "3.0"],
            logger: pino({ level: 'warn' }),
            auth: state
        })


        client.ev.on('messages.upsert', async m => {
            try {
                const msg = m.messages[0]
                if (!msg.message) return
                msg.message = (Object.keys(msg.message)[0] === 'ephemeralMessage') ? msg.message.ephemeralMessage.message : msg.message
                if (!msg.message) return
                if (msg.key && msg.key.remoteJid == 'status@broadcast') return
                if (msg.key.fromMe) return

                const from = msg.key.remoteJid
                const type = Object.keys(msg.message)[0]
                const time = moment.tz('America/Sao_Paulo').format('HH:mm:ss')

                var body = (type === 'conversation') ? msg.message.conversation : (type == 'imageMessage') ?
                    msg.message.imageMessage.caption : (type == 'videoMessage') ?
                        msg.message.videoMessage.caption : (type == 'extendedTextMessage') ?
                            msg.message.extendedTextMessage.text : (type == 'buttonsResponseMessage') ?
                                msg.message.buttonsResponseMessage.selectedButtonId : (type == 'listResponseMessage') ?
                                    msg.message.listResponseMessage.singleSelectReply.selectedRowId : ''

                const isMedia = type.includes('videoMessage') || type.includes('imageMessage') || type.includes('stickerMessage') || type.includes('audioMessage') || type.includes('documentMessage')

                const isCmd = prefix.includes(body != '' && body.slice(0, 1)) && body.slice(1) != ''
                const command = isCmd ? body.slice(1).trim().split(' ')[0].toLowerCase() : ''
                const args = body.trim().split(/ +/).slice(1)
                const isGroup = from.endsWith('@g.us')
                const pushname = msg.pushName || "Sem Nome"

                const groupMetadata = isGroup ? await client.groupMetadata(from) : ''
                const groupName = isGroup ? groupMetadata.subject : ''
                
                const reply = (mensagem) => {
                    client.sendMessage(from, { text: mensagem }, { quoted: msg });
                }
				
                switch (command) {
                	
                        case 'ajuda':
                        
                        	const buttons = [
								{buttonId: '$ajuda', buttonText: {displayText: "❔AJUDA"}, type: 1},
								{buttonId: '$adesivo', buttonText: {displayText: "🌃 ADESIVOS "}, type: 1},
								{buttonId: '$nextpage', buttonText: {displayText: "⏭️ PRÓXIMA PÁGINA "}, type: 1}
							]
					
							const ajuda = {
						
							text: `Estou aqui para facilitar a criação de adesivos para WhatsApp, sem precisar de sair do próprio WhatsApp!\n\nConsigo atuar em grupos ou em conversas privadas!\n\nE além de conseguir fazer os adesivos convencionais, também sou capaz de fazer adesivos animados.\n\nPara começar, basta clicar em algumas das seguintes opções:`,
							footerText: 'Não consegue ver os botões? Mande $notas',
    						buttons: buttons,
    						headerType: 1
    
							}
							client.sendMessage(from, ajuda) 

                            break
						
						case 'nextpage':
				
							const buttons1 = [
								{buttonId: '$faq', buttonText: {displayText: "📃PERGUNTAS FREQUENTES"}, type: 1},
								{buttonId: '$doação', buttonText: {displayText: "💰 DOAÇÕES "}, type: 1},
								{buttonId: '$info', buttonText: {displayText: "📄 INFORMAÇÕES "}, type: 1}
							]

							const nextpage = {
								text: `Estou aqui para facilitar a criação de adesivos para WhatsApp, sem precisar de sair do próprio WhatsApp!\n\nConsigo atuar em grupos ou em conversas privadas!\n\nE além de conseguir fazer os adesivos convencionais, também sou capaz de fazer adesivos animados.\n\nPara começar, basta clicar em ajuda e escolher algumas dos seguintes opções:`,
								footerText: 'Não consegue ver os botões? Mande $notas',
    							buttons: buttons1,
    							headerType: 1
							}
							client.sendMessage(from, nextpage) 
							break

						}
				
					
                

            } catch (err) {
                console.log(err)
            }
        })
        client.ev.on('group-participants.update', async (update) => {
	     try {
		console.log(update)
	     } catch (error) {
		console.log(error)
	     }
        })
        return client
    }

    client = startSock()
    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            // reconnect if not logged out
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                sock = startSock()
            }
        }
        console.log('Connection Update: ', update)
    })

    // auto save dos dados da sessão
    client.ev.on('auth-state.update', () => saveState)
})()