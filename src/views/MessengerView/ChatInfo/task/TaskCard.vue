<script lang="ts" setup>
import { getHourMinute } from '@/utils/datetime.utils'
import IconButton from '@/components/form/IconButton.vue'
import IconImage from '@/components/IconImage.vue'
import { computed } from 'vue'
import Modal from '@/components/Modal.vue'
import { ref } from 'vue'
import TaskCardEdit from './TaskCardEdit.vue'
import type { TaskCardEditEvent, TaskCardTask } from './types'
import { useChatService } from '@/services/chat.service'
import { useNotify } from '@/hooks/notify'
import { TaskStatuses } from '@/stores/chat.store'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{
  delete: []
}>()

const chatService = useChatService()
const notify = useNotify()
const { t } = useI18n()

const task = defineModel<TaskCardTask>({ required: true })
const overdue = computed(
  () => new Date().getTime() > task.value.dueDate.getTime(),
)
const done = computed(() => task.value.status === TaskStatuses.Done)

const deleting = ref(false)
function deleteTask() {
  deleting.value = true
  chatService
    .deleteTask(task.value.id)
    .then(() => {
      emit('delete')
      notify(t('taskDeleted'), 'success')
    })
    .catch(() => {
      notify(t('daskDeleteError'), 'error')
    })
    .finally(() => {
      deleting.value = false
    })
}

const editVisible = ref(false)
function onTaskEdit(e: TaskCardEditEvent) {
  Object.assign(task.value, e.value)
  editVisible.value = false
}
</script>

<template>
  <div
    class="flex p-2 border border-solid border-gray-6 dark:border-surface-600 dark:bg-surface-700 rounded-md border-r-4"
    :class="{
      'border-r-red-600 dark:border-r-red-600': !done && overdue,
      'border-r-orange-400 dark:border-r-orange-400': !done && !overdue,
      'border-r-green-600 dark:border-r-green-600': done,
    }"
  >
    <div class="grow">
      <!-- Text -->
      <p class="text-sm">{{ task.text }}</p>
      <!-- Time & date -->
      <div
        class="flex items-center gap-1"
        :class="
          done
            ? 'text-green-600'
            : overdue
              ? 'text-red-600'
              : 'text-gray-2 dark:text-white/80'
        "
      >
        <IconImage name="time" class="size-3" />
        <span class="text-sm">{{ getHourMinute(task.dueDate) }}</span>
        <div
          class="h-4 border-l border-gray-6 mx-1"
          :class="[
            overdue ? 'dark:border-surface-400' : 'dark:border-white/80',
          ]"
        ></div>
        <IconImage name="calendar" class="size-3" />
        <span class="text-sm">{{ task.dueDate.toLocaleDateString() }}</span>
      </div>
    </div>
    <div class="flex gap-2 items-center">
      <!-- Edit -->
      <IconButton
        icon="pencil"
        class="text-primary-500 size-6"
        @click="editVisible = true"
      />
      <!-- Remove -->
      <IconButton
        icon="trash"
        class="text-red-600 size-6"
        @click="deleteTask"
        :loading="deleting"
      />
    </div>

    <!-- Edit modal -->
    <Modal v-model:visible="editVisible">
      <TaskCardEdit :task="task" @edit="onTaskEdit" />
    </Modal>
  </div>
</template>
