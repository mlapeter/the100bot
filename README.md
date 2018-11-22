# the100bot

Official Discord Bot for The100.io

This bot was created using Discord.js: https://discordjs.guide/#/ and Discord.js Commando: https://dragonfire535.gitbooks.io/discord-js-commando-beginners-guide/

## Contributions Welcome!

For minor fixes and improvements, feel free to create a new branch, then submit a PR when you're ready. For larger additions, get in touch with @muhuhuhaha or @FearBroner on our discord: https://discord.gg/aVhkdHT to discuss first. You can also reach us at https://www.the100.io/help

## Quick Start

- For initial setup and testing, you'll first want to create a test account on our staging site: https://pwn-staging.herokuapp.com
- Clone this repo.
- Create a file called .env at the root of the application and add the following:
  DISCORD_BOT_TOKEN="123"
  OWNER_DISCORD_ID="123"
  THE100_API_TOKEN="123"
  THE100_API_BASE_URL="https://pwn-staging.herokuapp.com/api/v2/"
- Replace "123" with your private tokens. (Warning: both Discord and The100.io tokens are the equivalent of your account password - do not share or post publicly!)
- DISCORD_BOT_TOKEN is provided by Discord: go to Applications > Bot > "Click to Reveal Token"
- OWNER_DISCORD_ID is your Discord user id. You can find this by right clicking your username and select "Copy ID"
- THE100_API_TOKEN can be generated from your edit profile page. For testing, you can create an account on our staging server at https://pwn-staging.herokuapp.com and generate it there.
- THE100_API_BASE_URL is the API url. For testing, point it to our staging server. The full base url is "https://pwn-staging.herokuapp.com/api/v2/". If you later point it to The100.io, make sure you also generate a new API token from your real account on The100.io.
- On our staging site, create a new group: http://pwn-staging.herokuapp.com/groups/new
- Go to the edit group page, and click the link to add the discord bot to your server. Make sure to add both the bot and the webhook when it asks you.
- Start your bot server locally by typing `npm start` in your terminal.
- You should now be able to type "!the100status" in your discord server and the bot should reply.
- You should also be able to create a new game by typing for example "!create raid tomorrow at 9pm" and then view your upcoming games by typing "!games"

Working? Great! Contact us in our discord: https://discord.gg/aVhkdHT and message @muhuhuhaha and we can generate a production api key so you can connect to The100.io. Your bot will then be able to create, join, and leave gaming sessions on behalf of your group members.

Not Working? Not Great! Contact @muhuhuhaha or @FearBroner in our Discord and we'll try to get things sorted.
