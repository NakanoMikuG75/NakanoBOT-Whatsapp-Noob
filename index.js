/* eslint-disable no-unused-vars */
const { create, Client } = require('@open-wa/wa-automate')
const { color, options } = require('./tools')
const { ind, eng } = require('./message/text/lang/')
const { loader } = require('./function')
const { version, bugs } = require('./package.json')
const msgHandler = require('./message/index.js')
const figlet = require('figlet')
const canvas = require('discord-canvas')
const config = require('./config.json')
const ownerNumber = config.ownerBot
const fs = require('fs-extra')
const { groupLimit, memberLimit } = require('./database/bot/setting.json')

const start = (nakano = new Client()) => {
    console.log(color(figlet.textSync('----------------', { horizontalLayout: 'default' })))
    console.log(color(figlet.textSync('HITMAN-Miku BOT', { font: 'Ghost', horizontalLayout: 'default' })))
    console.log(color(figlet.textSync('----------------', { horizontalLayout: 'default' })))
    console.log(color('=> Bot successfully loaded! Database:', 'yellow'), color(loader.getAllDirFiles('./database').length), color('Library:', 'yellow'), color(loader.getAllDirFiles('./lib').length), color('Function:', 'yellow'), color(loader.getAllDirFiles('./function').length))
    console.log(color('=> Source code version:', 'yellow'), color(version))
    console.log(color('=> Bugs? Errors? Suggestions? Visit here:', 'yellow'), color(bugs.url))
    console.log(color('[Nakano]'), color('nakanoBOT is now online!', 'yellow'))
    console.log(color('[DEV]', 'cyan'), color('Welcome back, Owner! Hope you are doing well~', 'magenta'))

    //loader.nocache('../message/index.js', (m) => console.log(color('[WATCH]', 'orange'), color(`=> '${m}'`, 'yellow'), 'file is updated!'))

    nakano.onStateChanged((state) => {
        console.log(color('[Nakano]'), state)
        if (state === 'UNPAIRED' || state === 'CONFLICT' || state === 'UNLAUNCHED') nakano.forceRefocus()
    })

    nakano.onAddedToGroup(async (chat) => {
        const gc = await nakano.getAllGroups()
        console.log(color('[Nakano]'), 'Added a to new group. Name:', color(chat.contact.name, 'yellow'), 'Total members:', color(chat.groupMetadata.participants.length, 'yellow'))
        if (chat.groupMetadata.participants.includes(ownerNumber)) {
            await nakano.sendText(chat.id, ind.addedGroup(chat))
        } else if (gc.length > groupLimit) {
            await nakano.sendText(chat.id, `Max groups reached!\n\nCurrent status: ${gc.length}/${groupLimit}`)
            await nakano.deleteChat(chat.id)
            await nakano.leaveGroup(chat.id)
        } else if (chat.groupMetadata.participants.length < memberLimit) {
            await nakano.sendText(chat.id, `Need at least ${memberLimit} members in group!`)
            await nakano.deleteChat(chat.id)
            await nakano.leaveGroup(chat.id)
        } else {
            await nakano.sendText(chat.id, ind.addedGroup(chat))
        }
    })

    nakano.onMessage((message) => {
        nakano.getAmountOfLoadedMessages()
            .then((msg) => {
                if (msg >= 1000) {
                    console.log(color('[Nakano]'), color(`Loaded message reach ${msg}, cuting message cache...`, 'yellow'))
                    nakano.cutMsgCache()
                    console.log(color('[Nakano]'), color('Cache deleted!', 'yellow'))
                }
            })
        msgHandler(bocchi, message)
        // require('./message/index.js')(bocchi, message)
    })

    nakano.onIncomingCall(async (callData) => {
        await nakano.sendText(callData.peerJid, ind.blocked(ownerNumber))
        await nakano.contactBlock(callData.peerJid)
        console.log(color('[BLOCK]', 'red'), color(`${callData.peerJid} has been blocked.`, 'yellow'))
    })

    nakano.onGlobalParticipantsChanged(async (event) => {
        const _welcome = JSON.parse(fs.readFileSync('./database/group/welcome.json'))
        const isWelcome = _welcome.includes(event.chat)
        const gcChat = await nakano.getChatById(event.chat)
        const pcChat = await nakano.getContact(event.who)
        let { pushname, verifiedName, formattedName } = pcChat
        pushname = pushname || verifiedName || formattedName
        const { name, groupMetadata } = gcChat
        const botNumbers = await nakano.getHostNumber() + '@c.us'
        try {
            if (event.action === 'add' && event.who !== botNumbers && isWelcome) {
                const pic = await nakano.getProfilePicFromServer(event.who)
                if (pic === undefined) {
                    var picx = 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTQcODjk7AcA4wb_9OLzoeAdpGwmkJqOYxEBA&usqp=CAU'
                } else {
                    picx = pic
                }
                const welcomer = await new canvas.Welcome()
                    .setUsername(pushname)
                    .setDiscriminator(event.who.substring(6, 10))
                    .setMemberCount(groupMetadata.participants.length)
                    .setGuildName(name)
                    .setAvatar(picx)
                    .setColor('border', '#00100C')
                    .setColor('username-box', '#00100C')
                    .setColor('discriminator-box', '#00100C')
                    .setColor('message-box', '#00100C')
                    .setColor('title', '#00FFFF')
                    .setBackground('https://www.photohdx.com/images/2016/05/red-blurry-background.jpg')
                    .toAttachment()
                const base64 = `data:image/png;base64,${welcomer.toBuffer().toString('base64')}`
                await nakano.sendFile(event.chat, base64, 'welcome.png', `Welcome ${pushname}!`)
            } else if (event.action === 'remove' && event.who !== botNumbers && isWelcome) {
                const pic = await nakano.getProfilePicFromServer(event.who)
                if (pic === undefined) {
                    var picxs = 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTQcODjk7AcA4wb_9OLzoeAdpGwmkJqOYxEBA&usqp=CAU'
                } else {
                    picxs = pic
                }
                const bye = await new canvas.Goodbye()
                    .setUsername(pushname)
                    .setDiscriminator(event.who.substring(6, 10))
                    .setMemberCount(groupMetadata.participants.length)
                    .setGuildName(name)
                    .setAvatar(picxs)
                    .setColor('border', '#00100C')
                    .setColor('username-box', '#00100C')
                    .setColor('discriminator-box', '#00100C')
                    .setColor('message-box', '#00100C')
                    .setColor('title', '#00FFFF')
                    .setBackground('https://www.photohdx.com/images/2016/05/red-blurry-background.jpg')
                    .toAttachment()
                const base64 = `data:image/png;base64,${bye.toBuffer().toString('base64')}`
                await nakano.sendFile(event.chat, base64, 'welcome.png', `Bye ${pushname}, we will miss you~`)
            }
        } catch (err) {
            console.error(err)
        }
    })
}

create(options(start))
    .then((nakano) => start(nakano))
    .catch((err) => console.error(err))
