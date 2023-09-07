<template>
  <b-form @submit.prevent="submit">
    <draggable v-model="channels" :options="{ handle: '.handle' }">
      <b-form-group v-for="(channel, index) in channels" :key="index">
        <div
          role="button"
          class="handle"
          style="width: min-content; padding: 5px"
        >
          :::
        </div>
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
            ></b-form-input>
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

export default {
  components: {
    draggable,
  },
  data() {
    return {
      channels: [
        {
          name: "ВКонтакте",
          selected: false,
          maxMessageLength: 4096,
          message: {
            text: "",
            keyboard: {
              inline: false,
              maxButtons: 40,
              maxButtonTextLength: Infinity,
              supportsLinks: true,
              buttons: [],
            },
          },
        },
        {
          name: "Telegram",
          selected: false,
          maxMessageLength: 4096,
          message: {
            text: "",
            keyboard: {
              inline: false,
              maxButtons: 10,
              maxButtonTextLength: 20,
              supportsLinks: false,
              buttons: [],
            },
          },
        },
        {
          name: "WhatsApp",
          selected: false,
          maxMessageLength: 1000,
          message: {
            text: "",
            keyboard: {
              inline: false,
              maxButtons: 10,
              maxButtonTextLength: 20,
              supportsLinks: false,
              buttons: [],
            },
          },
        },
        {
          name: "SMS",
          selected: false,
          maxMessageLength: undefined,
          message: { text: "", keyboard: null },
        },
      ],
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
      if (channel.message.keyboard.inline) {
        channel.message.keyboard.maxButtons = 10;
        channel.message.keyboard.maxButtonTextLength = 20;
        channel.message.keyboard.supportsLinks = true;
        channel.message.keyboard.buttons.forEach((button) => {
          button.url = "";
        });
      } else {
        channel.message.keyboard.maxButtons = 40;
        channel.message.keyboard.maxButtonTextLength = Infinity;
        channel.message.keyboard.supportsLinks = channel.name === "ВКонтакте";
        channel.message.keyboard.buttons.forEach((button) => {
          button.url = undefined;
        });
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
  },
};
</script>
