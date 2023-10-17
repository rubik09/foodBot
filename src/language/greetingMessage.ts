const greetings: [string, string][] = [
  [
    'ru',
    `Добро пожаловать в службу поддержки 1win!
Я ваш виртуальный помощник.
Выберите, пожалуйста, категорию обращения:`,
  ],

  [
    'en',
    `Welcome to 1win Support!
I am your virtual assistant.
Please select an appeal category:`,
  ],

  [
    'pt',
    `Bem-vindo ao Suporte 1win!
Eu sou seu assistente virtual.
Selecione uma categoria:`,
  ],

  [
    'es',
    `¡Bienvenido al soporte de 1win!
Soy tu asistente virtual.
Seleccione una categoría de apelación:`,
  ],

  [
    'fr',
    `Bienvenue sur l'assistance 1win!
Je suis votre assistant virtuel.
Veuillez sélectionner une catégorie de votre question:`,
  ],

  [
    'tr',
    `1win müşteri hizmetlerine hoş geldiniz!
Ben sizin sanal asistanınızım.
Lütfen başvuru kategorisini seçin:`,
  ],

  [
    'az',
    `1win müştəri xidmətinə xoş gəlmisiniz!
Mən sizin virtual köməkçinizəm.
Zəhmət olmasa müraciət kateqoriyasını seçin:`,
  ],

  [
    'uz',
    `1win qo'llab-quvvatlash xizmatiga xush kelibsiz!
Men sizni virtual yordamchingizman.
Iltimos, murojaatingiz mavzusini tanlang:`,
  ],
];

const greetingImgLinks: [string, string][] = [
  [
    'ru',
    'https://images.unsplash.com/photo-1697451735065-f23cbfc6b218?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80',
  ],

  ['en', 'https://i.ibb.co/rtWVBnw/gallery.jpg'],
];

export default new Map<string, string>(greetings);
export const greetingImgLinksMap = new Map<string, string>(greetingImgLinks);
