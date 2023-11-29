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
    const product = await getProduct(productLink)

    if (product.available) {
        for (const chatId of subscribers) {
            notify(chatId, product);
        }
    }

    setTimeout(loop, 30000);
})();

bot.onText(/^\/me/, (msg) => {
    bot.sendMessage(msg.chat.id, `Chat ID: ${msg.chat.id}`);
});

bot.onText(/^\/check/, async (msg) => {
    const product = await getProduct(productLink);

    notify(msg.chat.id, product);
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

function notify(chatId, product) {
    const text = product.available ? 'Товар в наличии!' : 'Товара нет в наличии!';

    return bot.sendMessage(chatId, `${text}\n${product.price}\n${product.link}`);
}