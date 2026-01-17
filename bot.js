const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const path = require('path');

const BOT_TOKEN = '8524606829:AAGIeB1RfnpsMvkNgfZiTi2R1bBf3cU8IgA'; 
const WEB_APP_URL = 'https://mimo-bot-xno2.onrender.com'; 

const bot = new Telegraf(BOT_TOKEN);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Commande de démarrage
bot.start((ctx) => {
    ctx.replyWithMarkdownV2(
        `*Welcome to ONE DUCK 🦆*\n\nTap the duck, earn coins, and climb the leaderboard\\!`,
        Markup.inlineKeyboard([
            [Markup.button.webApp('🚀 Play ONE DUCK', WEB_APP_URL)],
            [Markup.button.url('Join Community 📢', 'https://t.me/Ducksmajor_bot')]
        ])
    );
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

bot.launch();
