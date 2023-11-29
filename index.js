import TelegramBot from 'node-telegram-bot-api';
import { parse } from 'node-html-parser';

const productLink = 'https://clubturbo.ru/catalog/podveska/rychagi_podveski/rychagi_na_zhiguli/rychagi_drift_komplekt/';
const token = '6349791090:AAF_LLzZORPn6BGQneJXvLpzQmQYL7GePK4';
const subscribers = [
    759406684,
    302273127
];

const bot = new TelegramBot(token, { polling: true });

(async function loop() {
    const { price, available } = await getProduct(productLink)

    if (available) {
        for (const chatId of subscribers) {
            notify(chatId, price);
        }
    }

    setTimeout(loop, 30000);
})();

bot.onText(/^\/me/, (msg, match) => {
    bot.sendMessage(msg.chat.id, `Chat ID: ${msg.chat.id}`);
});

bot.onText(/^\/check/, async (msg, match) => {
    const product = await getProduct(productLink);

    bot.sendMessage(msg.chat.id, JSON.stringify(product));
});

bot.on('message', (msg) => {
    bot.sendMessage(msg.chat.id, 'I\'m alive!');
});

async function getProduct(productLink) {
    const response = await fetch(productLink);
    const html = await response.text();

    const root = parse(html);

    const currentEl = (root.querySelector('.cart-action-form__buy-button'));
    const priceEl = (root.querySelector('.price > span'));

    const price = priceEl?.textContent.trim() ?? 'N\A';

    const styleAttr = currentEl.getAttribute('style');
    const available = styleAttr === undefined;

    return {
        link: productLink,
        price,
        available
    }
}

function notify(chatId, price) {
    return bot.sendMessage(chatId, `Товар в наличии!\n${price}\n${productLink}`);
}