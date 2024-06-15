<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Password from 'primevue/password'
import Button from '@/components/form/Button.vue'
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/user.store'
import { useNotify } from '@/hooks/notify'
const { t } = useI18n()

const notify = useNotify()
const userStore = useUserStore()
const error = ref<string | null>(null)
const disabled = ref(true)
const passwords = ref({
  password: '',
  newPassword: '',
})

const fields = [
  {
    field: t('profileSafety.newPassword'),
    type: 'string',
    placeholder: '',
    key: 'password',
  },
  {
    field: t('profileSafety.repeatPassword'),
    type: 'string',
    placeholder: '',
    key: 'newPassword',
  },
]

const checkPasswords = () => {
  if (passwords.value.password && passwords.value.newPassword) {
    if (passwords.value.password !== passwords.value.newPassword) {
      error.value = t('profileSafety.passwordsNotEqual')
    } else {
      if (passwords.value.password.length >= 8) {
        error.value = null
        disabled.value = false
      } else {
        error.value = t('profileSafety.passwordIsTooShort')
      }
    }
  } else {
    disabled.value = true
    error.value = null
  }
  return !error.value && !disabled.value
}

watch(passwords.value, () => {
  checkPasswords()
})

const save = () => {
  if (checkPasswords()) {
    userStore
      .patchUserProfile({ password: passwords.value.password })
      .then(() => {
        notify('Пароль изменен')
        passwords.value = {
          password: '',
          newPassword: '',
        }
      })
  }
}
</script>

<template>
  <div class="border">
    <p class="mt-4 flex flex-col px-4 mb-2 font-bold text-lg">
      {{ t('profileSafety.safety') }}
    </p>
    <div
      class="flex flex-col flex-wrap gap-3 p-fluid mx-3 mb-4 my-2 px-2 gap-x-2.5 bg-gray-15 rounded pt-7 pb-2"
    >
      <div
        class="flex grow flex-col"
        v-for="field in fields"
        :key="field.field"
      >
        <label :for="field.field" class="text-gray-16">{{ field.field }}</label>
        <Password
          class="grow w-full"
          input-class="w-full"
          :placeholder="field.field"
          v-model="passwords[field.key]"
          :id="field.field"
          :feedback="false"
          toggleMask
        />
      </div>
      <span class="text-sm text-red-500" v-if="error">
        {{ error }}
      </span>
    </div>

    <div class="flex flex-col gap-x-2.5 p-3 relative">
      <Button
        :label="t('profileSafety.save')"
        class="justify-center"
        theme="red"
        icon="pi pi-save"
        :disabled="error || disabled"
        @click="save"
      />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
