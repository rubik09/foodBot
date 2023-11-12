export async function sendMessageAndKeyboard(userTelegramId: number, text: string, buttons: { text: string }[][]) {
  this.bot.sendMessage(userTelegramId, text, {
    reply_markup: {
      keyboard: buttons,
      one_time_keyboard: true,
      resize_keyboard: true,
    },
  });
}
