<template>
  <b-form @submit.prevent="submit">
    <b-form-group v-for="(channel, index) in channels" :key="index">
      <b-form-checkbox v-model="channel.selected">
        {{ channel.name }}
      </b-form-checkbox>
      <b-form-textarea v-model="channel.message" :max="channel.maxMessageLength" placeholder="Введите сообщение"></b-form-textarea>
      <b-form-group v-if="channel.selected && channel.keyboard">
        <b-form-checkbox v-model="channel.keyboard.inline">
          Inline клавиатура
        </b-form-checkbox>
        <b-form-group v-for="(button, i) in channel.keyboard.buttons" :key="i">
          <b-form-input v-model="button.text" :max="channel.keyboard.maxButtonTextLength" placeholder="Текст кнопки"></b-form-input>
          <b-form-input v-if="channel.keyboard.supportsLinks" v-model="button.url" placeholder="URL кнопки"></b-form-input>
          <b-button variant="danger" @click="channel.keyboard.buttons.splice(i, 1)">Удалить кнопку</b-button>
        </b-form-group>
        <b-button variant="primary" @click="channel.keyboard.buttons.push({ text: '', url: '' })">Добавить кнопку</b-button>
      </b-form-group>
    </b-form-group>
    <b-button type="submit" variant="success">Сохранить</b-button>
  </b-form>
</template>

<script>
export default {
  data() {
    return {
      channels: [
        { name: 'ВКонтакте', selected: false, message: '', maxMessageLength: 4096, keyboard: { inline: false, maxButtons: 40, maxButtonTextLength: undefined, supportsLinks: true, buttons: [] } },
        { name: 'Telegram', selected: false, message: '', maxMessageLength: 4096, keyboard: { inline: false, maxButtons: undefined, maxButtonTextLength: undefined, supportsLinks: false, buttons: [] } },
        { name: 'WhatsApp', selected: false, message: '', maxMessageLength: 1000, keyboard: { inline: false, maxButtons: 10, maxButtonTextLength: 20, supportsLinks: false, buttons: [] } },
        { name: 'SMS', selected: false, message: '', maxMessageLength: undefined, keyboard: null }
      ]
    };
  },
  methods: {
    async submit() {
  const campaign = {
    channels: this.channels.filter(c => c.selected).map(c => c.name),
    messages: this.channels.filter(c => c.selected).map(c => ({ channel: c.name, text: c.message, keyboard: c.keyboard }))
  };
  const response = await fetch('/api/campaigns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: "include",
    body: JSON.stringify(campaign)
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}
}
};
</script>
