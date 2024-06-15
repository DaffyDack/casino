<script lang="ts" setup>
import { computed, ref, unref } from 'vue'
import InputText from '@/components/form/InputText.vue'
import Button from '@/components/form/Button.vue'
import Dropdown from '@/components/form/Dropdown.vue'
import Calendar from 'primevue/calendar'
import type { PropType } from 'vue'
import { watch } from 'vue'
import MultiSelect from '@/components/form/MultiSelect.vue'
import type { TaskCardEditEvent, TaskCardTask } from './types'
import { useChatService } from '@/services/chat.service'
import { useNotify } from '@/hooks/notify'
import { TaskStatuses, useChatStore } from '@/stores/chat.store'
import { TASK_STATUSES } from './const'
import { validateTask } from './utils'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user.store'

const props = defineProps({
  task: {
    type: Object as PropType<TaskCardTask>,
    required: true,
  },
})
const emit = defineEmits<{
  edit: [TaskCardEditEvent]
}>()

const chatService = useChatService()
const userStore = useUserStore()
const notify = useNotify()
const { t } = useI18n()

const edittingTask = ref<TaskCardTask>({ ...props.task })
const valid = computed(() => validateTask(edittingTask.value))
watch(
  () => props.task,
  (task) => {
    edittingTask.value = { ...task }
  },
)

const submitting = ref(false)
function submit() {
  const task = edittingTask.value
  submitting.value = true
  chatService
    .editTask(task.id, {
      player: props.task.chatId,
      status: task.status,
      text: task.text,
      end_date: task.dueDate.toISOString(),
      users: task.assignees,
    })
    .then(() => {
      emit('edit', { value: task })
      notify(t('taskUpdated'), 'success')
    })
    .catch(() => {
      notify(t('taskUpdateError'), 'error')
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
        {{ $t('taskEditting') }}
        <span class="text-primary-500">"{{ task.text }}"</span>
      </p>
      <div class="mt-4">
        <p class="text-sm font-medium text-gray-2 dark:text-gray-400">
          {{ $t('taskTitle') }}:
        </p>
        <InputText
          :placeholder="$t('typeTitle')"
          v-model="edittingTask.text"
          class="w-full"
        />
      </div>
      <div class="mt-4">
        <p class="text-sm font-medium text-gray-2 dark:text-gray-400">
          {{ $t('assignee') }}:
        </p>
        <MultiSelect
          class="w-full"
          v-model="edittingTask.assignees"
          :options="userStore.managers"
          option-label="username"
          option-value="id"
          filter
        />
      </div>
      <div class="mt-4">
        <p class="text-sm font-medium text-gray-2 dark:text-gray-400">
          {{ $t('status') }}:
        </p>
        <Dropdown
          class="w-full"
          v-model="edittingTask.status"
          :options="TASK_STATUSES"
          option-label="label"
          option-value="value"
        />
      </div>
    </div>
    <div class="mt-5 pt-5 border-t border-gray-6">
      <p class="text-gray-1 dark:text-gray-400 font-bold">
        {{ $t('dueDate') }}
      </p>
      <Calendar
        v-model="edittingTask.dueDate"
        :show-time="true"
        class="w-full mvp-calendar"
        input-class="!p-0 !px-2 !py-0.5"
        show-icon
      />
    </div>
    <Button
      :label="$t('editTask').toUpperCase()"
      icon="pi pi-save"
      class="mt-5 w-full justify-center"
      @click="submit"
      :loading="submitting"
      :disabled="!valid"
    />
  </div>
</template>

<style>
// TODO: WIP need to fix it before merge
.mvp-calendar button {
  padding: 0;
  display: flex;
  justify-content: center;
}
.mvp-calendar svg {
  margin: 0 auto;
}
</style>
@/hooks/notify
