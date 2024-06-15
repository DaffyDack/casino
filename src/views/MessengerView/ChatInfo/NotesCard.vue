<script lang="ts" setup>
import IconButton from '@/components/form/IconButton.vue'
import InputText from 'primevue/inputtext'
import MessageInput from '@/views/MessengerView/Chat/MessageInput.vue'
import Card from '@/components/Card.vue'
import Chips from '@/components/form/Chips.vue'
import { reactive, watch } from 'vue'
import Button from '@/components/form/Button.vue'
import TaskCard from './task/TaskCard.vue'
import TaskCardCreate from './task/TaskCardCreate.vue'
import { ref } from 'vue'
import Modal from '@/components/Modal.vue'
import { useChatStore, type Chat } from '@/stores/chat.store'
import { useChatService } from '@/services/chat.service'
import { useNotify } from '@/hooks/notify'
import type { TaskCardCreateEvent, TaskCardTask } from './task/types'
import { useI18n } from 'vue-i18n'
import IconImage from '@/components/IconImage.vue'
import { DateTime } from 'luxon'
import { remove } from 'lodash'
import { storeToRefs } from 'pinia'

const props = defineProps({
  chatId: {
    type: Number,
    required: true,
  },
})

const chatStore = useChatStore()
const { chats } = storeToRefs(chatStore)
const chatService = useChatService()
const notify = useNotify()
const comment = ref<string>()
const { t } = useI18n()

const chat = ref<Chat>()
const chatTasks = ref<TaskCardTask[]>([])
watch(
  () => props.chatId,
  (id) => {
    refresh()
  },
  { immediate: true },
)

function refresh() {
  chatStore.fetchChat(props.chatId).then((c) => {
    chat.value = c
  })
  chatStore.fetchChatTasks(props.chatId, { cached: false }).then((tasks) => {
    chatTasks.value = tasks.map(
      (task): TaskCardTask => ({
        id: task.id,
        chatId: task.chatId,
        status: task.status,
        text: task.text,
        dueDate: task.dueDate,
        assignees: task.assignees,
      }),
    )
  })
}

function updateChatTags() {
  if (chat.value) {
    const savedChat = chatStore.archivedChats[chat.value.id]
    const tags = chat.value.tags
    return chatService
      .updateChat(chat.value.id, {
        tags: chat.value.tags.join(','),
      })
      .then(() => {
        savedChat!.tags = tags
      })
      .catch(() => {
        notify(t('tagsUpdateError'), 'error')
      })
  }
}

const creatingTaskModalVisible = ref(false)
function onTaskCreate(e: TaskCardCreateEvent) {
  chatTasks.value.push(e.value)
  creatingTaskModalVisible.value = false
}

function commentCreate() {
  if (comment.value) {
    chatStore.createComment(props.chatId, comment.value)
    comment.value = ''
  }
}

function removeComment(commentId: number) {
  chatStore.removeComment(props.chatId, commentId)
}
</script>

<template>
  <Card
    class="w-full"
    :header="$t('notes').toUpperCase()"
    :foldable="true"
    fold-key="folded_chatInfo_notes"
    v-if="chat"
  >
    <div class="flex flex-col gap-2">
      <Chips
        v-model="chat.tags"
        :placeholder="$t('typeTags')"
        @update:model-value="updateChatTags"
      />
      <div class="comment-input">
        <InputText class="comment-input__input" v-model="comment" />
        <IconButton
          :disabled="!comment?.trim()"
          icon="paper-plane"
          class="comment-input__icon"
          :class="{ 'comment-input__icon--disabled': !comment?.trim() }"
          @click="commentCreate"
        ></IconButton>
      </div>
      <div class="chat-comments">
        <div
          class="chat-comments__item"
          v-if="chats[chat.id].commentaries"
          v-for="comment in chats[chat.id].commentaries"
          :key="comment.id"
        >
          <div class="chat-comments__data">
            <div class="chat-comments__comment">
              {{ comment.text }}
            </div>
            <div class="chat-comments__author">
              <IconImage name="at" class="chat-comments__at" />
              {{ comment.user.username }}
            </div>
            <div class="chat-comments__date">
              <IconImage name="calendar" class="chat-comments__calendar" />
              {{ DateTime.fromISO(comment.created_on).toFormat('dd.MM.yyyy') }}
            </div>
          </div>
          <div class="chat-comments__remove">
            <IconButton
              class="chat-comments__trash-icon"
              icon="trash"
              @click="removeComment(comment.id)"
            />
          </div>
        </div>
      </div>
      <Button
        class="justify-center"
        icon="pi pi-plus"
        :label="$t('addTask').toUpperCase()"
        theme="blue"
        @click="creatingTaskModalVisible = true"
      />
      <Modal v-model:visible="creatingTaskModalVisible">
        <TaskCardCreate @create="onTaskCreate" :chat-id="chatId" />
      </Modal>
      <ul class="list-none">
        <li v-for="(task, index) in chatTasks">
          <TaskCard
            :class="{ 'mt-2': index }"
            v-model="chatTasks[index]"
            @delete="chatTasks.splice(index, 1)"
          />
        </li>
      </ul>
    </div>
  </Card>
</template>

<style lang="scss" scoped>
.comment-input {
  position: relative;
  display: flex;
  align-items: center;
  &__input {
    width: 100%;
    border: 1px solid #d7d8dc;
    min-height: 30px;
    height: 30px;
    padding: 5px 35px 5px 5px;
    font-size: 0.8rem;
    border-radius: 5px;
    box-shadow: unset;
    .dark & {
      border: 1px solid #3b4061;
      &:focus {
        border: 1px solid rgb(96, 165, 250);
      }
    }
    &:focus {
      border: 1px solid #3575e6;
      outline: none;
    }
  }
  &__icon {
    position: absolute;
    right: 10px;
    top: 5px;
    width: 20px;
    color: #3575e6;
    &--disabled {
      color: rgb(209, 213, 219);
    }
  }
}

.chat-comments {
  display: flex;
  flex-flow: column;
  gap: 5px;
  &__item {
    display: flex;
    border: 1px solid #d7d8dc;
    padding: 10px;
    max-width: 100%;
    align-items: center;
    justify-content: space-between;
    border-radius: 5px;
    gap: 10px;
    .dark & {
      border: 1px solid #3b4061;
    }
  }
  &__comment {
    word-break: break-word;
    max-width: 100%;
    font-size: 0.85rem;
  }
  &__author {
    display: flex;
    align-items: center;
    font-size: 0.95rem;
    margin-top: 5px;
  }
  &__at {
    width: 19px;
    color: black;
    margin-right: 5px;
    .dark & {
      color: #9d9db7;
    }
  }
  &__date {
    display: flex;
    align-items: center;
    font-size: 0.95rem;
  }
  &__calendar {
    width: 19px;
    margin-right: 5px;
  }
  &__remove {
    width: 19px;
  }
  &__trash-icon {
    width: 19px;
    color: rgb(227, 38, 69);
  }
}
</style>
