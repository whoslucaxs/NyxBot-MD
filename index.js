
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
} = require('@adiwajshing/baileys-md')
var pino = require("pino");
var baileys = require("@adiwajshing/baileys-md");
const axios = require('axios').default
const fs = require('fs')
const moment = require('moment-timezone')
const chalk = require('chalk')
const CFonts  = require('cfonts')
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
	response.sendStatus(200);
			
	});
	app.listen(process.env.PORT); 


const { help } = require('./database/menu/help')
const { criador } = require('./database/menu/criador')
const { faq } = require('./database/menu/faq')
const { pix_txt } = require('./database/menu/pix')
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

const { saveState, state } = useSingleFileAuthState('./database/auth.json');


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
				const isVideo = type.includes('videoMessage')
				const isImage = type.includes('imageMessage')
				
                const isCmd = prefix.includes(body != '' && body.slice(0, 1)) && body.slice(1) != ''
                const command = isCmd ? body.slice(1).trim().split(' ')[0].toLowerCase() : ''
                const args = body.trim().split(/ +/).slice(1)
                const isGroup = from.endsWith('@g.us')
                const getNumber = from.split('@')[0]
                
                const pushname = msg.pushName || "Sem Nome"

                const groupMetadata = isGroup ? await client.groupMetadata(from) : ''
                const groupName = isGroup ? groupMetadata.subject : ''
                
                const reply = (mensagem) => {
                    client.sendMessage(from, { text: mensagem });
                }
				
                switch (command) {
                	
                		case 'test':
                
                		reply(getNumber)
                
                		break
                	
                        case 'ajuda':
                        
                        	const buttons = [
								{buttonId: '$ajuda', buttonText: {displayText: "❔AJUDA"}, type: 1},
								{buttonId: '$adesivo', buttonText: {displayText: "🌃 ADESIVOS "}, type: 1},
								{buttonId: '$nextpage', buttonText: {displayText: "⏭️ PRÓXIMA PÁGINA "}, type: 1}
							]
					
							const ajuda = {
							image: {url: "./database/media/help.jpg"},
							caption: `Estou aqui para facilitar a criação de adesivos para WhatsApp, sem precisar de sair do próprio WhatsApp!\n\nConsigo atuar em grupos ou em conversas privadas!\n\nE além de conseguir fazer os adesivos convencionais, também sou capaz de fazer adesivos animados.\n\nPara começar, basta clicar em algumas das seguintes opções:`,
							footerText: 'Não consegue ver os botões? Mande $notas',
    						buttons: buttons,
    						headerType: 4
    
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
								image: {url: "./database/media/help.jpg"},
								caption: `Estou aqui para facilitar a criação de adesivos para WhatsApp, sem precisar de sair do próprio WhatsApp!\n\nConsigo atuar em grupos ou em conversas privadas!\n\nE além de conseguir fazer os adesivos convencionais, também sou capaz de fazer adesivos animados.\n\nPara começar, basta clicar em ajuda e escolher algumas dos seguintes opções:`,
								footerText: 'Não consegue ver os botões? Mande $notas',
    							buttons: buttons1,
    							headerType: 4
							}
							client.sendMessage(from, nextpage) 
							break
						
						case 'info':

							const doacoes = [
							
							{buttonId: '$doação', buttonText: {displayText: "💰 DOAÇÕES "}, type: 1},
							
							]
					
							const sendDoacoes = {
						
								text: `${criador(pushname, botName, ownerName)}`,
    							buttons: doacoes,
    							headerType: 1
    
							}
							client.sendMessage(from, sendDoacoes) 
							
							break
						
						case 'faq':
				
							client.sendMessage(from, { text: faq(pushname)})
							break
						
						case 'doação':
					
							client.sendMessage(from, { text: pix_txt(pushname, botName, ownerName)})
							await sleep(150)
							reply("Chave Aleatória:")
							await sleep(150)
							reply(`${pix}`)
							
							break
						
						case 'adesivo':
						case 'sticker':
						
							if (!isMedia) {
						
								reply(`Olá ${pushname}!\n\nEstá tentando criar um adesivo?\n\nEstamos com um novo sistema de adesivos, em chats privados você pode apenas enviar a imagem, vídeo ou gif, que iremos processar sua requisição imediatamente.\n\nJá em grupos, você deve adicionar $sticker ou $adesivos na legenda do arquivo para que possamos reconhecer sua requisição.` )
							
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
    					   	author: '@NyxBot_', // The author name
    						   type: StickerTypes.FULL, // The sticker typeg
    						   categories: ['🤩', '🎉'], // The sticker category
 						      id: `${getNumber}`, // The sticker id
   							quality: 50, // The quality of the output file
   							background: '#00000000' // The sticker background color (only for full stickers)
							   })

							  const save = await sticker.toBuffer() // convert to buffer

							  await sticker.toFile(`${getNumber}.webp`)

							  client.sendMessage(from, { sticker: { url: getNumber + ".webp" }})
							
							  try {
											
									fs.unlinkSync(getNumber + ".jpeg" );
									await sleep(500)
									fs.unlinkSync(getNumber + ".webp" );
									
								} catch (error) {
									reply("😵 Calma aí, não consigo processar tudo isso ao mesmo tempo, vamos com calma!")
								}
							
							}
							if (isMedia && isVideo && msg.message.videoMessage.seconds > 9) {
								
								reply('Indentificamos que o tamanho do vídeo requisitado é muito grande, mande no máximo um vídeo de nove segundos para que possamos reconhecê-lo!')
								
							}else if (isMedia && isVideo && msg.message.videoMessage.seconds < 10 )  {

       						 const stream = await downloadContentFromMessage(msg.message.videoMessage, 'video')
       						 reply('Iniciando Requisição...')
								reply('Esse processo costuma demora, por favor tenha paciência.\nEnquanto isso, visite nosso Instagram: https://www.instagram.com/nyxbot_/')
       						 let buffers = Buffer.from([]);
       
    						    for await(const chunk of stream) {
        					    buffers = Buffer.concat([buffers, chunk]);
       						 }
       						 const mediaa = `./${getNumber}.mp4`
      						  // save to file
       						 fs.writeFileSync(mediaa, buffers)
       
       						const sticker = new Sticker(`./${getNumber}.mp4`, {
   							pack: pushname, // The pack name
    					   	author: '@NyxBot_', // The author name
    						   type: StickerTypes.FULL, // The sticker typeg
    						   categories: ['🤩', '🎉'], // The sticker category
 						      id: `${getNumber}`, // The sticker id
   							quality: 50, // The quality of the output file
   							background: '#00000000' // The sticker background color (only for full stickers)
							   })

							  const save = await sticker.toBuffer() // convert to buffer

							  await sticker.toFile(`${getNumber}.webp`)

							  client.sendMessage(from, { sticker: { url: getNumber + ".webp" }})
							  
							  try {
											
									fs.unlinkSync(getNumber + ".mp4" );
									await sleep(500)
									fs.unlinkSync(getNumber + ".webp" );
									
								} catch (error) {
									reply("😵 Calma aí, não consigo processar tudo isso ao mesmo tempo, vamos com calma!")
								}
							
						   }
						   
						break
						case '':
						
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
    					   	author: '@NyxBot_', // The author name
    						   type: StickerTypes.FULL, // The sticker typeg
    						   categories: ['🤩', '🎉'], // The sticker category
 						      id: `${getNumber}`, // The sticker id
   							quality: 50, // The quality of the output file
   							background: '#00000000' // The sticker background color (only for full stickers)
							   })

							  const save = await sticker.toBuffer() // convert to buffer

							  await sticker.toFile(`${getNumber}.webp`)

							  client.sendMessage(from, { sticker: { url: getNumber + ".webp" }})
							
							  try {
											
									fs.unlinkSync(getNumber + ".jpeg" );
									await sleep(500)
									fs.unlinkSync(getNumber + ".webp" );
									
								} catch (error) {
									reply("😵 Calma aí, não consigo processar tudo isso ao mesmo tempo, vamos com calma!")
								}
							
							}
							if (isMedia && isVideo && msg.message.videoMessage.seconds > 9) {
								
								reply('Indentificamos que o tamanho do vídeo requisitado é muito grande, mande no máximo um vídeo de nove segundos para que possamos reconhecê-lo!')
								
							}else if (isMedia && isVideo && msg.message.videoMessage.seconds < 10 )  {

       						 const stream = await downloadContentFromMessage(msg.message.videoMessage, 'video')
       						 reply('Iniciando Requisição...')
								reply('Esse processo costuma demora, por favor tenha paciência.\nEnquanto isso, visite nosso Instagram: https://www.instagram.com/nyxbot_/')
       						 let buffers = Buffer.from([]);
       
    						    for await(const chunk of stream) {
        					    buffers = Buffer.concat([buffers, chunk]);
       						 }
       						 const mediaa = `./${getNumber}.mp4`
      						  // save to file
       						 fs.writeFileSync(mediaa, buffers)
       
       						const sticker = new Sticker(`./${getNumber}.mp4`, {
   							pack: pushname, // The pack name
    					   	author: 'NyxBot', // The author name
    						   type: StickerTypes.FULL, // The sticker typeg
    						   categories: ['🤩', '🎉'], // The sticker category
 						      id: `${getNumber}`, // The sticker id
   							quality: 50, // The quality of the output file
   							background: '#00000000' // The sticker background color (only for full stickers)
							   })

							  const save = await sticker.toBuffer() // convert to buffer

							  await sticker.toFile(`${getNumber}.webp`)

							  client.sendMessage(from, { sticker: { url: getNumber + ".webp" }})
							  
							  try {
											
									fs.unlinkSync(getNumber + ".mp4" );
									await sleep(500)
									fs.unlinkSync(getNumber + ".webp" );
									
								} catch (error) {
									reply("😵 Calma aí, não consigo processar tudo isso ao mesmo tempo, vamos com calma!")
								}
							
						   }
						   
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