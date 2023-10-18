export const langMap = {
  Русский: 'ru',
  English: 'en',
  Portuguesa: 'pt',
  Español: 'es',
  Français: 'fr',
  Uzbek: 'uz',
  Türkçe: 'tr',
  Azerbaijani: 'az',
};

export const actionsMap = {
  mainActions: {
    templateText: '{{mainActions}}',
  },
  back: {
    templateText: '{{back}}',
    actionName: 'back',
  },
  support: {
    templateText: '{{support}}',
    actionName: 'support',
  },
  begin: {
    templateText: '{{begin}}',
    actionName: 'begin',
  },
  greeting: {
    templateText: '{{greeting}}',
    actionName: 'greeting',
  },
};
// Default greeting image will send if there are no specified image for current language
export const greetingImageLink = 'https://i.ibb.co/rtWVBnw/gallery.jpg';
