<script lang="ts" setup>
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import { ref } from 'vue'
import { useChatService } from '@/services/chat.service'
import { useRouter } from 'vue-router'
import { useNotify } from '@/hooks/notify'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user.store'
import { useAuthService } from '@/services/auth.service'

const userStore = useUserStore()
const authService = useAuthService()
const router = useRouter()
const notify = useNotify()
const { t } = useI18n()

const username = ref('')
const password = ref('')
const submitting = ref(false)
function submit() {
  submitting.value = true
  authService
    .login({ username: username.value, password: password.value })
    .then(() => {
      notify(t('loginSuccess'), 'success')
      location.replace('/')
    })
    .catch(() => {
      notify(t('loginError'), 'error')
    })
    .finally(() => {
      submitting.value = false
    })
}
</script>

<template>
  <div class="w-96 py-2" v-focustrap>
    <div class="flex gap-2 justify-center">
      <img src="@/assets/img/bull.svg?image" width="38px" />
      <img src="@/assets/img/logo-text-black.svg?image" />
    </div>
    <p class="mt-5 mb-2 text-2xl text-center">{{ $t('authorization') }}</p>
    <div class="flex flex-col gap-3 mb-4">
      <InputGroup>
        <InputGroupAddon>
          <i class="pi pi-envelope"></i>
        </InputGroupAddon>
        <InputText placeholder="Email" v-model="username" />
      </InputGroup>
      <InputGroup class="w-full">
        <InputGroupAddon>
          <i class="pi pi-lock"></i>
        </InputGroupAddon>
        <Password
          :placeholder="$t('password')"
          v-model="password"
          :feedback="false"
          :pt="{
            root: {
              class: 'w-full',
            },
            input: {
              root: {
                class: 'w-full rounded-l-none',
              },
            },
          }"
          :pt-options="{ mergeProps: true }"
          @keypress.enter="submit()"
        />
      </InputGroup>
    </div>
    <!-- <div>
      <label>
        <Checkbox/> Запомнить меня
      </label>
    </div> -->
    <Button
      :label="$t('enter').toUpperCase()"
      class="w-full bg-red-600 hover:bg-red-700"
      severity="danger"
      :disabled="!username.trim() || !password"
      :loading="submitting"
      @click="submit"
    />
    <!-- <p>Нет аккаунт? <router-link>Создать новый аккаунт</router-link></p> -->
  </div>
</template>
@/hooks/notify
