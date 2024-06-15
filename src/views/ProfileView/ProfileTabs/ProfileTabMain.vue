<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import InputText from '@/components/form/InputText.vue'
import Button from '@/components/form/Button.vue'
import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user.store'
import { useNotify } from '@/hooks/notify'

const { t } = useI18n()
const notify = useNotify()
const userStore = useUserStore()
const userData = ref({
  name: '',
  email: '',
  telegram: '',
  theme: '',
})
const { user } = storeToRefs(userStore)
const fields = [
  { field: t('profileMain.name'), type: 'string', key: 'name' },
  { field: t('profileMain.email'), type: 'string', key: 'email' },
  { field: t('profileMain.messenger'), type: 'select', key: 'telegram' },
]

const updateUserData = () => {
  userData.value.name = user.value?.name || ''
  userData.value.email = user.value?.email || ''
  userData.value.telegram = user.value?.telegram || ''
  userData.value.theme = user.value?.theme || ''
}

const save = () => {
  userStore
    .patchUserProfile(userData.value)
    .then(() => notify('Данные профиля изменены'))
}

watch(user, updateUserData)

onMounted(updateUserData)
</script>

<template>
  <div class="border">
    <p class="mt-4 flex flex-col px-4 mb-2 font-bold text-lg">
      {{ t('profileMain.basicInformation') }}
    </p>
    <div
      class="flex flex-wrap gap-3 p-fluid mx-3 mb-4 my-2 px-2 gap-x-2.5 bg-gray-15 rounded pt-7 pb-2"
    >
      <div
        class="flex grow flex-col"
        v-for="field in fields"
        :key="field.field"
      >
        <label :for="field.field" class="text-gray-16">{{ field.field }}</label>
        <InputText
          class="grow"
          :placeholder="field.field"
          v-model="userData[field.key]"
          :id="field.field"
        />
      </div>
    </div>

    <div class="flex flex-col gap-x-2.5 p-3">
      <label for="typeMessage" class="top-3 text-gray-16">{{
        t('profileMain.messengerTheme')
      }}</label>
      <InputText
        class="grow mb-7 mt-2"
        :placeholder="t('profileMain.messengerTheme')"
        id="typeMessage"
        v-model="userData.theme"
      />
      <Button
        :label="t('profileMain.save')"
        class="justify-center"
        theme="red"
        icon="pi pi-save"
        @click="save"
      />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
