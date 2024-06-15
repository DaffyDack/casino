<script lang="ts" setup>
import Modal from '@/components/Modal.vue'
import Button from '@/components/form/Button.vue'
import Calendar from 'primevue/calendar'
import Checkbox from '@/components/form/Checkbox.vue'
import IconButton from '@/components/form/IconButton.vue'
import InputText from '@/components/form/InputText.vue'
import TabPanel from '@/components/form/TabPanel.vue'
import TabView from '@/components/form/TabView.vue'
import { reactive } from 'vue'
import { i18n } from '@/plugins/i18n'

const fields = [
  {
    enabled: true,
    label: i18n.global.t('registrationLink'),
    type: 'text',
    value: 'https:getbootstrap.com/',
  },
  {
    enabled: true,
    label: i18n.global.t('registrationDate'),
    type: 'date',
    value: new Date(),
  },
  {
    enabled: true,
    label: i18n.global.t('playerId'),
    type: 'number',
    value: 10,
  },
] as (TextField | NumberField | DateField)[]

interface Field<T, V> {
  enabled: boolean
  label: string
  type: T
  value: V
}
type TextField = Field<'text', string>
type NumberField = Field<'number', number>
type DateField = Field<'date', Date>

const changed = reactive<Record<number, boolean>>({})
</script>

<template>
  <Modal :style="{ 'max-width': '40rem' }">
    <p class="text-lg font-bold text-center">Отображение информации</p>
    <TabView class="mt-4">
      <TabPanel :header="i18n.global.t('manager').toUpperCase()">
        <p class="mt-4 mb-2 font-bold text-sm">ИНФОРМАЦИЯ ОБ ИГРОКЕ</p>
        <div class="flex gap-1">
          <Button
            class="grow justify-center"
            label="ДОБАВИТЬ ДАТУ"
            :outlined="true"
            theme="gray"
            icon="pi pi-calendar"
          />
          <Button
            class="grow justify-center"
            label="ДОБАВИТЬ ТЕКСТ"
            :outlined="true"
            theme="gray"
            icon="pi pi-pencil"
          />
          <Button
            class="grow justify-center"
            label="ДОБАВИТЬ ЦИФРУ"
            :outlined="true"
            theme="gray"
          />
        </div>
        <ul class="mt-4">
          <li
            v-for="(field, index) in fields"
            class="flex items-center gap-4 mt-2"
          >
            <Checkbox v-model="field.enabled" />
            <div class="grow">
              <InputText
                v-model="field.label"
                class="border-none !p-0 !h-auto text-xs"
              />
              <div class="flex gap-2 w-full">
                <div class="grow" @input="changed[index] = true">
                  <InputText
                    v-if="field.type === 'text'"
                    v-model="field.value"
                  />
                  <Calendar
                    v-else-if="field.type === 'date'"
                    v-model="field.value"
                  />
                  <InputText v-else v-model="field.value" />
                </div>
                <IconButton
                  :disabled="!changed[index]"
                  icon="pencil-white"
                  :class="[
                    'h-8 w-8 p-2',
                    changed[index] ? 'bg-primary-500' : 'bg-gray-5',
                  ]"
                  @click="changed[index] = false"
                />
              </div>
            </div>
          </li>
        </ul>
        <Button
          label="СОХРАНИТЬ"
          icon="pi pi-save"
          theme="red"
          class="w-full justify-center mt-4"
        />
      </TabPanel>
      <TabPanel header="АДМИН">
        Админка
        <p class="mt-4 mb-2 font-bold text-sm">ИНФОРМАЦИЯ ОБ ИГРОКЕ</p>
        <div class="flex gap-1">
          <Button
            class="grow justify-center"
            label="ДОБАВИТЬ ДАТУ"
            :outlined="true"
            theme="gray"
            icon="pi pi-calendar"
          />
          <Button
            class="grow justify-center"
            label="ДОБАВИТЬ ТЕКСТ"
            :outlined="true"
            theme="gray"
            icon="pi pi-pencil"
          />
          <Button
            class="grow justify-center"
            label="ДОБАВИТЬ ЦИФРУ"
            :outlined="true"
            theme="gray"
          />
        </div>
        <ul class="mt-4">
          <li
            v-for="(field, index) in fields"
            class="flex items-center gap-4 mt-2"
          >
            <Checkbox v-model="field.enabled" />
            <div class="grow">
              <InputText
                v-model="field.label"
                class="border-none !p-0 !h-auto text-xs"
              />
              <div class="flex gap-2 w-full">
                <div class="grow" @input="changed[index] = true">
                  <InputText
                    v-if="field.type === 'text'"
                    v-model="field.value"
                  />
                  <Calendar
                    v-else-if="field.type === 'date'"
                    v-model="field.value"
                  />
                  <InputText v-else v-model="field.value" />
                </div>
                <IconButton
                  :disabled="!changed[index]"
                  icon="pencil-white"
                  :class="[
                    'h-8 w-8 p-2',
                    changed[index] ? 'bg-primary-500' : 'bg-gray-5',
                  ]"
                  @click="changed[index] = false"
                />
              </div>
            </div>
          </li>
        </ul>
        <Button
          label="СОХРАНИТЬ"
          icon="pi pi-save"
          theme="red"
          class="w-full justify-center mt-4"
        />
      </TabPanel>
    </TabView>
  </Modal>
</template>
