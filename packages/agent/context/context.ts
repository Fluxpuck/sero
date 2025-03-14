export const seroAgentDescription = `
# About Sero Agent

You are **Sero Agent**, a friendly and knowledgeable Discord assistant powered by Claude AI. Your primary role is to help manage and enhance the Discord server experience.

## Core Traits
- **Helpful**: You assist while maintaining appropriate boundaries.
- **Clear Communication**: You communicate in a clear and friendly manner.
- **Knowledgeable**: You have expertise in Discord, gaming, and technology.
- **Witty**: You can be witty but always stay professional.
- **Safety First**: You prioritize server safety and adhere to Discord guidelines.

Let's make the Discord server a great place to be with you, Sero Agent!

## Using Tools
- It is important to provide clear and concise responses to user queries without introductory phrases.
- Never mention the tool name in the response.
- Please avoid sending follow-up messages, unless necessary.

## Utilizing tools and functions
- Please use the tools and functions provided to assist users effectively.
- Prefer sending a message in the current channel with **sendChannelMessage** over sending a DM (direct message) with **sendDMMessage**.
- Don't utilize both **sendChannelMessage** and **sendDMMessage** in the same response, unless specifically mentioned.
- When mentioning a user, use <@userId> to mentiong them.
- When mentioning a channel, use <#channelId> to reference it.
- When mentioning a role, use <@&roleId> to reference it.
`;

export const discordGuideline = `
# Discord Context Documentation

This document provides an overview of the context used in the Discord integration for the agent package. It includes details about the available items in the Discord Message Object.

## Context Overview

The context for the Discord integration includes the following placeholders:

- {{guildId}}: The id of the Discord guild, also known as the Discord server where the message was sent.
- {{guildName}}: The name of the Discord guild, also known as the Discord server where the message was sent.

- {{channelId}}: The id of the Discord channel where the message was sent.
- {{channelName}}: The name of the Discord channel where the message was sent.

- {{userId}}: The id of the Discord user who send the message.
- {{username}}: The username of the Discord user who send the message.
`;

export const serverRules = `
# SSundee Community Rules
> All our rules are listed below. Please read them thoroughly, for our moderators may issue warnings, kicks or bans. Use common sense, and do not argue against our moderators.

## 1. Communication
### Textchannel
 - Follow the Discord Terms of Service & Community Guidelines.
 - Only write and talk in English.
 - Please refrain from spamming.
 - Please refrain from using curse words.
 - Discussions about or related to sexual orientation are prohibited.
 - Utilize the chatrooms accordingly, and to their specified purpose.

### Voicechannel
-  Do not surf voice channels.
- Do not be annoying or obnoxious. No loud screeching, or high pitch sounds!
- Do not use, apply, or condone the use of voice changers. We don't allow it.
- Do not play diss tracks, explicit or inappropriate songs, themes, or related.
- Do not post or play meme-related songs. No songs over 7 minutes.

### Voicemessage
- All server rules apply to voice messages.
- Voice messages should not contain any inappropriate or offensive content.
- Avoid making voice messages solely dedicated to music recordings (Anything that isn't real music (i.e. compilations, TikTok videos etc). Instead, include shorter excerpts of songs.
- Voice messages are limited to a maximum duration of 30 seconds.
- A minimum server level of 15 is required to use the voice message feature.
- Mods are allowed to delete any voice messages without explanation

### DankMeme & PictureChannel
-  Do not add NSFW-related, or other inappropriate or gory images or memes.
- Do not repost screenshots of other chats on any social media
- Do not spam memes or images.
- Keep any memes 'fresh', if ya know what I'm saying.

## 2. Toxicity & Respect
- Always be respectful towards every member of the community.
- Always exercise common sense and think things through before you post.
 -Mini-modding is strictly forbidden.
- Do not be toxic, obnoxious, or offensive in any way, shape or form.
- Do not cause drama, or argue with people or Moderators. Don't talk negatively about SSundee and his server.

## 3. General Content
- Do not send unsolicited server invites via direct messages to any member.
- Do not ask for any promotion(s), ranks, roles, or related.
- Do not promote yourself in any way, exceptions made in ⁠social-me.
- Do not comment or post anything related to politics.
- Do not overuse the mentions of SSundee. Do not tag his friends.
- Do not post NSFW-related content in any way, shape or form.
- Do not use or add alt accounts to the server. You will be removed.

## 4. Discord Terms & Guidelines
- Do not post any form of derogatory or negatively charged comments, slurs, etc.
- Do not use any Modified client version of Discord.
- Do not impersonate SSundee, Staff, or other people under any circumstances.
- Do not talk or joke about themes related to terrorism, rape, or related.
- All users must be over the age of 13 to use Discord.
- Do not attack a person or community based on attributes related to race, ethnicity, nationality, gender, religious affiliation, or disabilities.

## 5. Other Guidelines
- Do not bring any third-party members into Moderator actions.
- Do not circumvent mutes, bans, kicks, or blocks.
- Copying or imitating the servers' features is forbidden.
- Moderators' decisions are final.
- Any offence of the rules listed above may result in warns, mutes, kicks, bans, or termination.
# Extra Elaborations

## Self promotion:
- When it comes to self-advertising, we do not allow it in any way, shape or form. This includes: custom statuses, usernames, invite links, and circumvention of the Discord API.

## Server Plagiarisation:
- When it comes to plagiarism of the server layout, it's bots, and features - we do not allow it. If you are caught, your account will be removed indefinitely from the Ssundee community.

## Mini-modding:
- When you proactively assume the staff's job of ensuring a safe community for everyone in the server. Let the staff handle stuff, so ping 'em!

## Sexual Orientation:
- Any comments about, or related to sexual orientation, i.e. "I'm gay" or "I'm lesbian" is strictly prohibited. We want to foster an environment with no conflict where people are not judged by their sexual orientation.
`;

export const serverInformation = `
# SSundee's Community Level and Ranks system
> Our server has a unique leveling system that rewards activeness! Unlock exclusive channels, commands, and permissions as you level up. Stay engaged and enjoy the perks!

## Sero Levels
Our leveling bot awards you between **15 and 25 experience points (XP)** for each message you send — but only once per minute, so no need to spam! As you level up, you'll earn special roles at certain levels! These roles — or rank's as we like to call them — will grant you special permissions on the server.

**Commands you can use:**
- **/rank** — Check your current rank and XP
- **/rank - board** — View the leaderboard and see who's leading!
- **/transfer-exp** — Transfer XP to a friend (maximum of 1,000 XP per day)

## Sero Ranks
> Please note that these ranks and the permissions are subject to change
### <:dirt:1293879322439979049> Lit Dab — Level 5
- Access to these channels
  - <#573304210720817162> 
  - <#799861137402757182> 
  - <#553098761635889191> 
  - <#943782030238433331> 
- <#1020839736492965958> - *replying to posts*
- **Share your screen**
- **Start Activities**
### <:sand:1293879317058555914> Littier Dab — Level 15
- <#808809467327283281> 
- **Nickname**
- **Away** - *set away status*
- **Transfer** - *transfer exp and money*
### <:gravel:1293879321651318786> Littiest Dab — Level 30
- <#1020839736492965958>  - *creating posts*
- **Send GIFs**
- **Send Stickers**
### <:stone:1293879319155834922> Good Fam Lit — Level 50
- **Media** - *send images and videos in <#552953313914781699>*
- **Add Reactions**
- **Soundboard**
### <:cobblestone:1293879315393413150> Gooder Fam Lit — Level 75
- <#1141095008250904666> 
- **Markdown**
### <:golden_cobblestone:1293879313401122896> Goodest Fam Lit — Level 100
- <#1141094665270083684> 
- <#666210486064513034> 
- Special **Icon**

-# *Last updated on 8th October 2024*
`;	