export default [
  {
    name: "ВКонтакте",
    maxMessageLength: 4096,
    keyboard: {
      inline: {
        maxButtons: 10,
        maxButtonTextLength: 20,
        supportsLinks: true,
      },
      standard: {
        maxButtons: 40,
        maxButtonTextLength: Infinity,
        supportsLinks: true,
      },
    },
  },
  {
    name: "Telegram",
    maxMessageLength: 4096,
    keyboard: {
      inline: {
        maxButtons: 3,
        maxButtonTextLength: 20,
        supportsLinks: true,
      },
      standard: {
        maxButtons: 10,
        maxButtonTextLength: 20,
        supportsLinks: false,
      },
    },
  },
  {
    name: "WhatsApp",
    maxMessageLength: 1000,
    keyboard: {
      inline: {
        maxButtons: 3,
        maxButtonTextLength: 20,
        supportsLinks: true,
      },
      standard: {
        maxButtons: 10,
        maxButtonTextLength: 20,
        supportsLinks: false,
      },
    },
  },
  {
    name: "SMS",
    maxMessageLength: undefined,
    keyboard: null,
  },
];
