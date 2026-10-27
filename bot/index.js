import { Bot, InlineKeyboard } from "grammy";

const SITE_URL = "https://lookatmedev.github.io/";
const CONTACT_URL = "https://t.me/AXIdesign";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Не задан BOT_TOKEN. Скопируйте .env.example в .env и вставьте токен от @BotFather.");
  process.exit(1);
}

const bot = new Bot(token);

const keyboard = () =>
  new InlineKeyboard()
    .webApp("Открыть портфолио", SITE_URL)
    .row()
    .url("Обсудить проект", CONTACT_URL);

const WELCOME =
  "AXI — дизайн и разработка сайтов.\n\n" +
  "Лендинги, сайты-визитки и интернет-магазины: продуманный дизайн, чистая вёрстка, запуск под ключ. " +
  "Первый этап показываю на согласование до основной работы.";

bot.command("start", (ctx) => ctx.reply(WELCOME, { reply_markup: keyboard() }));
bot.command("portfolio", (ctx) => ctx.reply("Портфолио:", { reply_markup: keyboard() }));
bot.command("contact", (ctx) =>
  ctx.reply("Расскажите о задаче, отвечу в течение дня.", {
    reply_markup: new InlineKeyboard().url("Написать в Telegram", CONTACT_URL),
  }),
);

// на любое другое сообщение подсказываем, как открыть портфолио
bot.on("message", (ctx) => ctx.reply("Откройте портфолио кнопкой ниже.", { reply_markup: keyboard() }));

bot.catch((err) => console.error("Ошибка в обработчике:", err.error));

await bot.api.setMyCommands([
  { command: "start", description: "Начать" },
  { command: "portfolio", description: "Открыть портфолио" },
  { command: "contact", description: "Связаться со мной" },
]);
// кнопка «Открыть» рядом с полем ввода запускает Mini App
await bot.api.setChatMenuButton({
  menu_button: { type: "web_app", text: "Портфолио", web_app: { url: SITE_URL } },
});

console.log("Бот запущен");
bot.start();
