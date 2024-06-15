<script lang="ts" setup>
import { computed, ref } from 'vue'
import InputText from '@/components/form/InputText.vue'
import Button from '@/components/form/Button.vue'
import Calendar from 'primevue/calendar'
import { TaskStatuses, useChatStore } from '@/stores/chat.store'
import type { TaskCardCreateEvent } from './types'
import { useNotify } from '@/hooks/notify'
import { useChatService } from '@/services/chat.service'
import MultiSelect from '@/components/form/MultiSelect.vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user.store'

const props = defineProps({
  chatId: {
    type: Number,
    required: true,
  },
})
const emit = defineEmits<{
  create: [TaskCardCreateEvent]
}>()

const userStore = useUserStore()
const chatService = useChatService()
const notify = useNotify()
const { t } = useI18n()

const title = ref('')
const resultTitle = computed(() => title.value.trim())
const assignees = ref<number[]>([])
const dueDate = ref<Date>()

const valid = computed(
  () => !!resultTitle.value && assignees.value.length && !!dueDate.value,
)

const submitting = ref(false)
function submit() {
  submitting.value = true
  chatService
    .addTask({
      player: props.chatId,
      text: resultTitle.value,
      end_date: dueDate.value!.toISOString(),
      users: assignees.value || [],
    })
    .then(({ id }) => {
      emit('create', {
        value: {
          id,
          chatId: props.chatId,
          status: TaskStatuses.New,
          text: resultTitle.value,
          dueDate: dueDate.value!,
          assignees: assignees.value,
        },
      })
      notify(t('taskAdded'), 'success')
    })
    .catch(() => {
      notify(t('taskAddError'), 'error')
    })
    .finally(() => {
      submitting.value = false
    })
}
</script>

<template>
  <div>
    <div>
      <p class="text-gray-1 dark:text-white/80 text-xl font-bold">
        {{ $t('taskAdding') }}
      </p>
      <div class="mt-4">
        <p class="text-sm font-medium">{{ $t('typeTitle') }}:</p>
        <InputText
          :placeholder="$t('taskTitle')"
          v-model="title"
          class="w-full"
        />
      </div>
      <div class="mt-4">
        <p class="text-sm font-medium">{{ $t('assignee') }}:</p>
        <MultiSelect
          class="w-full"
          v-model="assignees"
          :options="userStore.managers"
          option-label="username"
          option-value="id"
          filter
        />
      </div>
    </div>
    <div class="mt-5 pt-5 border-t border-gray-6">
      <p class="font-bold">{{ $t('dueDate') }}:</p>
      <Calendar class="w-full" v-model="dueDate" :show-time="true" show-icon />
    </div>
    <Button
      :label="$t('addTask').toUpperCase()"
      icon="pi pi-plus"
      class="mt-5 w-full justify-center"
      @click="submit"
      :disabled="!valid"
      :loading="submitting"
    />
  </div>
</template>
@/hooks/notify
