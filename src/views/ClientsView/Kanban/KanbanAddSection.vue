<script setup lang="ts">
import PlusIcon from '@/assets/icons/plus.svg'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import ArchiveIcon from '@/assets/icons/archive.svg'
import IgnoreIcon from '@/assets/icons/ignore.svg'
import BoldPlus from '@/assets/icons/bold-plus.svg'
import DeleteIcon from '@/assets/icons/x-icon.svg'
import SaveIcon from '@/assets/icons/save-icon.svg'
import Pallete from '@/views/ClientsView/Kanban/Pallete.vue'
import { object, string, ValidationError } from 'yup'
import { computed, ref, watch, nextTick } from 'vue'
import type { ClientsStage } from '@/models'
import InvalidMessage from '@/views/ClientsView/Kanban/InvalidMessage.vue'
import { useClientsService } from '@/services/clients.service'
import { useClientsStore } from '@/stores/clients.store'
import { storeToRefs } from 'pinia'

const clientsService = useClientsService()
const clientsStore = useClientsStore()
const { currentLine } = storeToRefs(clientsStore)
const titleSchema = string().required('Заполните название')
const schema = object({
  color: string().required('Колонка должна иметь цвет'),
  title: titleSchema,
})

const color = ref('#3575E6')
const showAddSection = ref(false)
const stageTitle = ref<string>()
const errors = ref<Partial<ClientsStage>>({})

interface StatusTypes {
  default: boolean
  ignore: boolean
  archive: boolean
}

const mStatus = {
  archive: 'Архив',
  ignore: 'Игнор',
  default: 'Стандарт',
}

const statuses = ref({
  archive: false,
  ignore: false,
  default: false,
})

const shownStatuses = computed(() => {
  const result = []

  for (const [key, value] of Object.entries(statuses.value)) {
    if (value) {
      result.push(mStatus[key as keyof typeof mStatus])
    }
  }
  return result as Array<keyof StatusTypes>
})

const updateStatus = (key: keyof StatusTypes, value: boolean) => {
  statuses.value[key] = value
}
const colorChangeHandler = (newColor: string) => {
  color.value = newColor
}

const saveStage = () => {
  const result = {
    color: color.value,
    title: stageTitle.value,
    ...statuses.value,
  }
  try {
    schema.validateSync(result)
    if (typeof currentLine.value !== 'undefined') {
      clientsStore.createStage(currentLine.value, result)
    }
    statuses.value = {
      archive: false,
      ignore: false,
      default: false,
    }
    stageTitle.value = ''
    // Ugly prevent watcher
    nextTick(() => (errors.value = {}))
  } catch (err) {
    const error = err as ValidationError
    const { path, message } = error
    if (path) {
      errors.value = { ...errors.value, [path]: message }
    }
  }
}

watch(stageTitle, () => {
  try {
    titleSchema.validateSync(stageTitle.value)
    errors.value.title = undefined
  } catch (err) {
    const error = err as ValidationError
    errors.value.title = error.message
  }
})
</script>

<template>
  <div class="clients-kanban__column">
    <Button class="add-button" @click="showAddSection = !showAddSection">
      <template #icon>
        <span class="flex items-center font-semibold text-sm uppercase">
          <PlusIcon class="add-button__icon" />
          Добавить
        </span>
      </template>
    </Button>
    <transition name="clients-fade">
      <div
        class="w-full border-gray-2 mt-2 flex flex-col settings"
        :style="{ borderColor: color }"
        v-if="showAddSection"
      >
        <InputText
          class="w-full"
          :class="{ 'invalid-text': !!errors.title }"
          placeholder="Введите название"
          v-model="stageTitle"
          aria-errormessage="asff"
        ></InputText>
        <InvalidMessage :message="errors.title" />
        <span class="font-semibold text-sm mt-1"> Категория статуса: </span>
        <Button class="button" @click="updateStatus('archive', true)">
          <template #icon>
            <div class="flex justify-between items-center w-full status-btn">
              <div class="flex items-center">
                <ArchiveIcon class="btn-icon mr-2" />
                <span class="font-semibold text-sm"> Архив </span>
              </div>
              <BoldPlus class="btn-icon" />
            </div>
          </template>
        </Button>
        <Button class="button" @click="updateStatus('ignore', true)">
          <div class="flex justify-between items-center w-full status-btn">
            <div class="flex items-center">
              <IgnoreIcon class="btn-icon mr-2" />
              <span class="font-semibold text-sm"> Игнор </span>
            </div>
            <BoldPlus class="btn-icon" />
          </div>
        </Button>
        <Button class="button" @click="updateStatus('default', true)">
          <div class="flex justify-between items-center w-full status-btn">
            <div class="flex items-center">
              <PlusIcon class="btn-icon mr-2" />
              <span class="font-semibold text-sm"> Стандарт </span>
            </div>
            <BoldPlus class="btn-icon" />
          </div>
        </Button>
        <div class="split"></div>
        <span class="font-semibold text-sm"> Добавленные статусы: </span>
        <div class="status-list">
          <div class="status" v-for="item in shownStatuses">
            <span> {{ item }} </span>
            <Button class="status__button" @click="updateStatus(item, false)">
              <template #icon>
                <DeleteIcon class="status__icon" />
              </template>
            </Button>
          </div>
        </div>
        <div class="split"></div>
        <span class="font-semibold text-sm"> Цвет статуса: </span>

        <Pallete @on-color-change="colorChangeHandler" :color="color" />
        <Button class="mt-2 save-button" @click="saveStage">
          <template #icon>
            <SaveIcon class="save-button__icon" />
            Сохранить
          </template>
        </Button>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.error-text {
  color: #ea0d32;
  font-size: 0.8rem;
}

.invalid-text {
  border: 1px #ea0d32 solid;
  &:focus {
    box-shadow: unset;
  }
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.save-button {
  background: #e32645;
  box-shadow: unset;
  width: 100%;
  color: white;
  text-transform: uppercase;
  &__icon {
    margin-right: 10px;
    fill: #ffffff;
  }
  &:hover {
    background: darken(#e32645, 5%);
  }
  &:active {
    background: darken(#e32645, 20%);
  }
  &:focus {
    box-shadow: unset;
  }
  &:active {
    box-shadow: unset;
  }
}
.add-button {
  background: #ffffff;
  box-shadow: unset;
  width: 100%;
  padding: 10px;
  color: black;
  .dark & {
    background: #232637;
    color: white;
    border: 1px solid #3b4061;
    &:hover {
      background: lighten(#232637, 5%);
    }
    &:active {
      background: lighten(#232637, 20%);
    }
  }
  &__icon {
    width: 1.5rem;
    height: 1.5rem;
    margin-right: 10px;
  }
  &:hover {
    background: darken(#ffffff, 5%);
  }
  &:active {
    background: darken(#ffffff, 20%);
  }
  &:focus {
    box-shadow: unset;
  }
  &:active {
    box-shadow: unset;
  }
}

.dark {
  .status-btn {
    color: white;
  }
}

.settings {
  background-color: #ffffff;
  padding: 10px;
  border: 1px solid;
  border-radius: 5px;
  .dark & {
    background: #232637;
    border: 1px solid #3b4061;
    color: white;
  }
}

.button {
  padding: 5px;
  margin-top: 5px;
}

.split {
  background-color: #d9d9d9;
  height: 1px;
  width: 100%;
  min-width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
  .dark & {
    background-color: #3b4061;
  }
}

.status {
  display: flex;
  justify-content: space-between;
  width: 100%;
  border: solid 1px #d7d8dc;
  border-radius: 5px;
  padding: 5px;
  .dark & {
    border: 1px solid #3b4061;
  }
  &__button {
    background-color: transparent;
    color: #e32645;
    box-shadow: unset;
    padding: 0;
    min-width: unset;
  }
  &__icon {
    width: 10px;
    height: 10px;
    fill: #e32645;
    &:hover {
      fill: darken(#e32645, 10%);
    }
  }
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 5px;
}
</style>
