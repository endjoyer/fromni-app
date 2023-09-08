<template>
  <b-form @submit.prevent="submit" class="form-container">
    <h1>Настройка каналов</h1>
    <draggable v-model="channels" :options="{ handle: '.handle' }">
      <b-form-group v-for="(channel, index) in channels" :key="index">
        <div role="button" class="handle">:::</div>
        <b-form-checkbox
          v-model="channel.selected"
          :disabled="!channel.maxMessageLength"
        >
          {{ channel.name }}
        </b-form-checkbox>
        <b-form-textarea
          v-model="channel.message.text"
          :max="channel.maxMessageLength"
          placeholder="Введите сообщение"
          :disabled="!channel.selected"
        ></b-form-textarea>
        <b-form-invalid-feedback :state="validateMessageLength(channel)">
          Сообщение не должно превышать {{ channel.maxMessageLength }} символов.
        </b-form-invalid-feedback>
        <b-form-group v-if="channel.selected && channel.message.keyboard">
          <b-form-checkbox
            v-model="channel.message.keyboard.inline"
            @change="toggleKeyboardType(channel)"
            :disabled="!channel.message.keyboard.maxButtons"
          >
            Inline клавиатура
          </b-form-checkbox>
          <b-form-group
            v-for="(button, i) in channel.message.keyboard.buttons"
            :key="i"
          >
            <b-form-input
              v-model="button.text"
              :max="channel.message.keyboard.maxButtonTextLength"
              placeholder="Текст кнопки"
              :disabled="!channel.message.keyboard.maxButtonTextLength"
            ></b-form-input>
            <b-form-invalid-feedback
              :state="validateButtonTextLength(button, channel)"
            >
              Текст кнопки не должен превышать
              {{ channel.message.keyboard.maxButtonTextLength }} символов.
            </b-form-invalid-feedback>
            <b-form-input
              v-if="channel.message.keyboard.supportsLinks"
              v-model="button.url"
              placeholder="URL кнопки"
              :state="button.url && validateUrl(button.url)"
            ></b-form-input>
            <b-form-invalid-feedback
              :state="button.url && validateUrl(button.url)"
            >
              Введите корректный URL.
            </b-form-invalid-feedback>
            <b-button
              variant="danger"
              @click="channel.message.keyboard.buttons.splice(i, 1)"
              >Удалить кнопку</b-button
            >
          </b-form-group>
          <b-button
            variant="primary"
            @click="addButton(channel)"
            :disabled="!validateButtonCount(channel)"
            >Добавить кнопку</b-button
          >
          <b-form-invalid-feedback :state="validateButtonCount(channel)">
            Количество кнопок не должно превышать
            {{ channel.message.keyboard.maxButtons }}.
          </b-form-invalid-feedback>
        </b-form-group>
      </b-form-group>
    </draggable>
    <b-button type="submit" variant="success" :disabled="!validateForm()"
      >Сохранить</b-button
    >
  </b-form>
</template>

<script>
import draggable from "vuedraggable";
import channelsConfig from "../utils/channelsConfig";

export default {
  components: {
    draggable,
  },
  data() {
    return {
      channels: channelsConfig.map((channel) => ({
        ...channel,
        selected: false,
        message: {
          text: "",
          keyboard: channel.keyboard
            ? {
                ...channel.keyboard.standard,
                inline: false,
                buttons: [],
              }
            : null,
        },
      })),
    };
  },
  methods: {
    async submit() {
      const campaign = {
        channels: this.channels.filter((c) => c.selected),
      };
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(campaign),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    },
    validateMessageLength(channel) {
      return (
        !channel.maxMessageLength ||
        channel.message.text.length <= channel.maxMessageLength
      );
    },
    validateButtonTextLength(button, channel) {
      return (
        !channel.message.keyboard.maxButtonTextLength ||
        button.text.length <= channel.message.keyboard.maxButtonTextLength
      );
    },
    validateButtonCount(channel) {
      return (
        !channel.message.keyboard.maxButtons ||
        channel.message.keyboard.buttons.length <
          channel.message.keyboard.maxButtons
      );
    },
    addButton(channel) {
      if (this.validateButtonCount(channel)) {
        channel.message.keyboard.buttons.push({ text: "", url: "" });
      }
    },
    toggleKeyboardType(channel) {
      if (channel.message.keyboard) {
        if (channel.message.keyboard.inline) {
          channel.message.keyboard = {
            ...channel.keyboard.inline,
            inline: true,
            buttons: channel.message.keyboard.buttons.map((button) => ({
              ...button,
              url: "",
            })),
          };
        } else {
          channel.message.keyboard = {
            ...channel.keyboard.standard,
            inline: false,
            buttons: channel.message.keyboard.buttons.map((button) => ({
              ...button,
              url: undefined,
            })),
          };
        }
      }
    },
    validateForm() {
      return this.channels.every((channel) => {
        if (channel.selected) {
          if (channel.message.text.length > channel.maxMessageLength) {
            return false;
          }
          if (channel.message.keyboard) {
            if (
              channel.message.keyboard.buttons.length >
              channel.message.keyboard.maxButtons
            ) {
              return false;
            }
            if (
              !channel.message.keyboard.buttons.every(
                (button) =>
                  button.text.length <=
                  channel.message.keyboard.maxButtonTextLength
              )
            ) {
              return false;
            }
          }
        }
        return true;
      });
    },
    validateUrl(url) {
      const pattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
          "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
          "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
          "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
          "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
          "(\\#[-a-z\\d_]*)?$",
        "i"
      ); // fragment locator
      return !!pattern.test(url);
    },
  },
};
</script>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.form-container .handle {
  cursor: move;
}

.form-container .b-form-group {
  margin-bottom: 20px;
}

.form-container .b-button {
  margin-top: 10px;
}

.handle {
  width: min-content;
  padding: 0 5px;
}

@media (max-width: 600px) {
  .form-container {
    max-width: 100%;
    padding: 10px;
  }
}
</style>
