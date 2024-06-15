<script lang="ts" setup>
import Card from '@/components/Card.vue'
import CopyField from '@/components/form/CopyField.vue'
import Dropdown from '@/components/form/Dropdown.vue'
import IconInputText from '@/components/form/IconInputText.vue'
import { useChatService } from '@/services/chat.service'
import { useChatStore, type Chat } from '@/stores/chat.store'
import { useNotify } from '@/hooks/notify'
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProfileService } from '@/services/profile.service'
import { useUserStore } from '@/stores/user.store'

const props = defineProps({
  chatId: {
    type: Number,
    required: true,
  },
})

const notify = useNotify()
const chatStore = useChatStore()
const userStore = useUserStore()
const chatService = useChatService()
const { t } = useI18n()

const chat = ref<Chat>()
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
    playerId.value = c.player_id ?? undefined
    platform.value = c.platform ?? undefined
    channelId.value = c.channel?.id
    assigneeId.value = c.resp?.id
    creationDate.value = new Date(c.created_at)
  })
}

const playerId = ref<string>()
function updatePlayerId() {
  if (chat.value && playerId.value) {
    const c = chatStore.archivedChats[chat.value.id]
    const val = playerId.value
    chatService
      .updateChat(chat.value?.id, { playerid: playerId.value })
      .then(() => {
        if (c) c.player_id = val ?? null
        notify(t('playerIdUpdated'), 'success')
      })
      .catch((e) => {
        if (c?.id === chat.value?.id) {
          playerId.value = chat.value?.player_id ?? undefined
        }
        notify(t('playerIdUpdateError'), 'error')
      })
  }
}

const platform = ref<string>()
function updatePlatform() {
  if (chat.value && platform.value) {
    const c = chatStore.archivedChats[chat.value.id]
    const val = platform.value
    chatService
      .updateChat(chat.value?.id, { platform: platform.value })
      .then(() => {
        if (c) c.platform = val ?? null
        notify(t('platformUpdated'), 'success')
      })
      .catch((e) => {
        if (c?.id === chat.value?.id) {
          platform.value = chat.value?.platform ?? undefined
        }
        notify(t('platformUpdateError'), 'error')
      })
  }
}

const channelId = ref<number>()
function updateChannel() {
  if (chat.value && channelId.value) {
    const c = chatStore.archivedChats[chat.value.id]
    const val = channelId.value
    chatService
      .updateChat(chat.value?.id, { channel: channelId.value })
      .then(() => {
        const ch = userStore.channels?.find((c) => c.id === val)
        if (c) c.channel = ch ? { id: ch.id, title: ch.name } : null
        notify(t('channelUpdated'), 'success')
      })
      .catch((e) => {
        if (c?.id === chat.value?.id) {
          channelId.value = chat.value?.channel?.id ?? undefined
        }
        notify(t('channelUpdateError'), 'error')
      })
  }
}

const assigneeId = ref<number>()
function updateAssignee() {
  if (chat.value && assigneeId.value != null) {
    const c = chatStore.archivedChats[chat.value.id]
    const val = assigneeId.value
    chatService
      .updateChat(chat.value?.id, { resp: assigneeId.value })
      .then(() => {
        const m = userStore.managers?.find((m) => m.id === val)
        if (c) c.resp = m ? { id: m.id, username: m.username } : null
        notify(t('assigneeUpdated'), 'success')
      })
      .catch((e) => {
        if (c?.id === chat.value?.id) {
          assigneeId.value = chat.value?.resp?.id ?? undefined
        }
        notify(t('assigneeUpdateFailure'), 'error')
      })
  }
}

const creationDate = ref<Date>()
</script>

<template>
  <Card
    class="w-full"
    :header="$t('infoAboutPlayer').toUpperCase()"
    :foldable="true"
    fold-key="folded_chatInfo_playerInfo"
    v-if="chat"
  >
    <div class="flex flex-col gap-2">
      <div>
        {{ $t('registrationLink') }}:
        <CopyField icon="hyperlink" :value="chat.reg_link" />
      </div>
      <div>
        {{ $t('playerId') }}:
        <IconInputText
          v-model="playerId"
          icon="pencil"
          icon-class="text-primary-500"
          @click-icon="updatePlayerId"
          class="border-solid"
        />
      </div>
      <div>
        {{ $t('platform') }}:<br />
        <Dropdown
          class="w-full"
          v-model="platform"
          :options="userStore.platforms"
          option-label="name"
          option-value="name"
          @change="updatePlatform"
          filter
        />
      </div>
      <div>
        {{ $t('channel') }}:<br />
        <Dropdown
          class="w-full"
          v-model="channelId"
          :options="userStore.channels"
          option-label="name"
          option-value="id"
          @change="updateChannel"
          filter
        />
      </div>
      <div>
        {{ $t('assignee') }}:<br />
        <Dropdown
          class="w-full"
          v-model="assigneeId"
          :options="userStore.managers"
          option-label="username"
          option-value="id"
          @change="updateAssignee"
          filter
        />
      </div>
      <div>
        <p
          class="flex justify-between"
          v-for="(value, label, index) in {
            [$t('country')]: chat.country,
            [$t('creationDate')]: chat.created_at
              ? new Date(chat.created_at).toLocaleDateString()
              : $t('wasNotCreated'),
            [$t('registrationDate')]: chat?.reg_date
              ? new Date(chat.reg_date).toLocaleDateString()
              : $t('didNotRegistered'),
            [$t('depositDate')]: chat.dep_date
              ? new Date(chat.dep_date).toLocaleDateString()
              : $t('didNotMakeDeposits'),
            [$t('depositCount')]: chat.deposit_count,
            [$t('depositAmount')]: chat.deposit_amount,
          }"
          :class="{
            'border-t border-gray-6 dark:border-surface-600 mt-2 pt-2': index,
          }"
        >
          <span class="text-sm font-medium">{{ label }}:</span>
          <span class="text-sm">{{ value }}</span>
        </p>
      </div>
    </div>
  </Card>
</template>
@/hooks/notify
