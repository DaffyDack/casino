<script setup lang="ts">
import InputText from '@/components/form/InputText.vue'
import Button from '@/components/form/Button.vue'
import Dialog from '@/components/Dialog.vue'
import ConfirmPopup from 'primevue/confirmpopup'
import Toast from 'primevue/toast'
import { ref } from 'vue'

import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

const visible1 = ref(false)
const visible2 = ref(false)
const confirm = useConfirm()
const toast = useToast()

const fun = () => {
  visible1.value = false
}

const fields = ref([
  {
    id: '81',
    field: '(Бот)',
    value: '',
    status: 'Ошибка авторизации',
    error: true,
    reason: 'Авторизация',
    bot: true,
    account: false,
    edit: false,
  },
  {
    id: '82',
    field: '(Бот)',
    value: '',
    status: 'Ошибка авторизации',
    error: true,
    reason: 'Пополнить баланс',
    bot: true,
    account: false,
    edit: false,
  },
  {
    id: '83',
    field: 'Не нашли такого аккаунта',
    value: '',
    status: 'Ошибка оплаты',
    error: true,
    reason: 'Авторизация',
    bot: false,
    account: true,
    edit: false,
  },
  {
    id: '84',
    field: '(Бот)',
    value: '',
    status: 'Ошибка оплаты',
    error: false,
    reason: 'Авторизация',
    bot: true,
    account: false,
    edit: false,
  },
  {
    id: '74',
    field: '(Бот)',
    value: '',
    status: 'Ошибка оплаты',
    error: false,
    reason: 'Авторизация',
    bot: true,
    account: false,
    edit: false,
  },
  {
    id: '85',
    field: '(Бот)',
    value: '',
    status: 'Ошибка оплаты',
    error: false,
    reason: 'Авторизация',
    bot: true,
    account: false,
    edit: true,
  },
])

const requireConfirmation = (event: any) => {
  confirm.require({
    target: event.currentTarget,
    group: 'headless',
    message: 'Are you sure? You cannot undo this.',
    accept: () => {
      toast.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'You have accepted',
        life: 3000,
      })
    },
    reject: () => {
      toast.add({
        severity: 'error',
        summary: 'Rejected',
        detail: 'You have rejected',
        life: 3000,
      })
    },
  })
}
</script>

<template>
  <div class="border">
    <div
      class="mt-4 flex items-center justify-between px-4 mb-2 font-bold text-lg"
    >
      {{ $t('profileConnection.communicationChannel') }}
      <div>
        <Toast />
        <ConfirmPopup group="headless">
          <template #container="{ acceptCallback, rejectCallback }">
            <div
              class="flex flex-col rounded-md p-3 border-solid border border-stone-500 miniPopup"
            >
              <span class="bot" @click="visible1 = true">{{
                $t('profileConnection.addBot')
              }}</span>
              <span class="account" @click="visible2 = true">{{
                $t('profileConnection.addAccount')
              }}</span>
            </div>
          </template>
        </ConfirmPopup>
        <div class="card flex justify-center">
          <Button
            @click="requireConfirmation($event)"
            icon="pi pi-plus-circle"
            label="Добавить"
          ></Button>
        </div>
      </div>
    </div>
    <div class="px-4 botsList">
      <ul class="w-[100%]">
        <li v-for="field in fields" class="flex justify-between md:flex-col">
          <div
            class="contentBot flex justify-between"
            :class="{ error: field.error }"
          >
            <div v-if="field.bot">{{ field.id }}:{{ field.field }}</div>
            <div v-else>{{ field.field }}</div>
            <div :class="{ error: field.error, account: field.account }">
              <div>Статус: {{ field.status }}</div>
            </div>
          </div>
          <div
            class="actionBottom"
            :class="{ error: field.error, bot: !field.bot }"
          >
            {{ field.reason }}
          </div>
          <div class="flex md:grid">
            <div class="actionBottom" :class="{ editBottom: field.edit }"></div>
            <div
              class="actionBottom"
              :class="{ deleteBottom: !field.error }"
            ></div>
          </div>
        </li>
      </ul>
    </div>
    <Dialog
      :label="$t('profileConnection.add')"
      :title="$t('profileConnection.enterNameBot')"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
      :visible="visible1"
      v-on:click="fun"
      :placeholder="$t('profileConnection.enterNameBot')"
    ></Dialog>
    <Dialog
      :label="$t('profileConnection.add')"
      :title="$t('profileConnection.addAccountName')"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
      :visible="visible2"
      v-on:click="visible2 = false"
      :placeholder="$t('profileConnection.enterPhoneNumber')"
    ></Dialog>

    <div class="flex flex-col gap-x-2.5 p-3 relative">
      <label class="absolute top-3 text-gray-16">{{
        $t('profileConnection.addBot')
      }}</label>
      <InputText class="grow my-7" :placeholder="$t('enterPhoneNumber')" />
      <Button
        :label="$t('addBot')"
        class="justify-center"
        icon="pi pi-reddit"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.botsList {
  ul {
    li {
      .actionBottom {
        border-radius: 4px;
        border: 1px solid #d7d8dc;
        padding: 10px 12px 10px 35px;
        margin-bottom: 10px;
        background-size: 12px;
        display: none;

        &.editBottom {
          display: block;
          margin-left: 7px;
          padding: 10px 20px;
          background: url('@/assets/icons/edit.svg') no-repeat center;

          &:hover {
            cursor: pointer;
          }
        }

        &.deleteBottom {
          display: block;
          margin-left: 7px;
          padding: 10px 20px;
          background: url('@/assets/icons/delete.svg') no-repeat center;

          &:hover {
            cursor: pointer;
          }
        }

        &.error {
          background: #e32645;
          color: #fff;
          min-width: 200px;
          margin-left: 7px;
          display: flex;
          padding: 5px;
          align-items: center;
          justify-content: center;

          &:hover {
            cursor: pointer;
          }

          &.bot {
            display: none;
          }
        }
      }

      .contentBot {
        width: 100%;
        border-radius: 4px;
        border: 1px solid #d7d8dc;
        padding: 10px 12px 10px 35px;
        margin-bottom: 10px;
        background: url('@/assets/icons/link.svg') no-repeat top 50% left 10px;
        background-size: 12px;

        &.error {
          background:
            url('@/assets/icons/error.svg') no-repeat top 50% left 5px,
            #e32645;
          color: #fff;
        }

        .account {
          display: none;
        }
      }
    }
  }
}

.miniPopup {
  min-width: 300px;

  span {
    padding: 10px 10px 10px 25px;

    &:hover {
      cursor: pointer;
    }

    &.bot {
      background: url('@/assets/icons/bot.svg') no-repeat left;
    }

    &.account {
      background: url('@/assets/icons/phone.svg') no-repeat left 3px center;
    }
  }
}

@media (max-width: 840px) {
  .botsList {
    ul {
      li {
        .actionBottom {
          margin-left: 0 !important;
          min-height: 43px;
          margin-bottom: 5px;
        }
        .contentBot {
          margin-bottom: 5px;
          margin-top: 10px;
        }
      }
    }
  }
}
</style>
