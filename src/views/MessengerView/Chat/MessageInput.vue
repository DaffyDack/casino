<script lang="ts" setup>
import { ref, watch } from 'vue'
import IconButton from '@/components/form/IconButton.vue'
import ResizebleTextarea from '@/components/form/ResizebleTextarea.vue'
import { computed } from 'vue'
import Menu from '@/components/form/Menu.vue'
import FileIconButton from '@/components/form/FileIconButton.vue'
import Modal from '@/components/Modal.vue'
import { formatByteSize } from '@/utils/string.utils'
import Button from '@/components/form/Button.vue'
import { parseMimeType } from '@/utils/file.utils'
import Checkbox from '@/components/form/Checkbox.vue'
import EmojiPicker, { type EmojiExt } from 'vue3-emoji-picker'
import OverlayPanel from '@/components/form/OverlayPanel.vue'
import { useI18n } from 'vue-i18n'
import IconImage from '@/components/IconImage.vue'

const props = defineProps({
  small: {
    default: false,
  },
  emoji: {
    default: false,
  },
  attachments: {
    default: false,
  },
  translator: {
    default: false,
  },
  read: {
    default: false,
  },
  send: {
    default: false,
  },
  enablePaste: {
    default: true,
  },
})
const emit = defineEmits<{
  submit: [
    text: string,
    options?: {
      translationLanguage?: string
      files?: {
        /**
         * file - формат в виде файла.
         * type-related - формат в зависимости от типа.
         * Формат - то, как отображется файл в чате.
         */
        format: 'file' | 'type-related'
        file: File
      }[]
    },
  ]
  read: []
}>()

// Modules
const { t } = useI18n()

// Assertions
console.assert(
  !props.attachments || props.send,
  'Cannot submit through attachments modal.',
)

// Text
const text = defineModel<string>({ default: '' })
const isTextValid = computed(() => !!text.value.trim())
const imagesCount = ref(0)
const showDropZone = ref(false)

// Files
const filesModalVisible = ref(false)
watch(filesModalVisible, (filesModalVisible) => {
  if (!filesModalVisible) {
    submittingFiles.value = []
  }
})
const submittingFiles = ref<SubmittingFile[]>([])
watch(submittingFiles, (files) => {
  if (!files.length) {
    filesModalVisible.value = false
  }
})
const removeFile = (file: SubmittingFile) => {
  submittingFiles.value = submittingFiles.value.filter((f) => f !== file)
}
function onFilesSubmit(files: File[]) {
  submittingFiles.value = files.map((f) => {
    const submittingFile: SubmittingFile = {
      img: '',
      name: f.name,
      size: f.size,
      type: parseMimeType(f.type).type ?? 'other',
      fileFormat: true,
      orig: f,
    }
    if (parseMimeType(f.type).type === 'image') {
      const reader = new FileReader()
      reader.readAsDataURL(f)
      reader.onload = () => {
        submittingFile.img = reader.result as string
        submittingFiles.value = [...submittingFiles.value]
      }
    }
    return submittingFile
  })

  filesModalVisible.value = true
}

// Event handlers
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    submit()
    e.preventDefault()
  }
}
function onPaste(e: ClipboardEvent) {
  if (e.clipboardData?.files?.length) {
    e.preventDefault()
    onFilesSubmit([...e.clipboardData.files])
  }
}

// Emoji
const emojiOPEvent = ref()
function onSelectEmoji(emoji: EmojiExt) {
  text.value += emoji.i
}

// Translator
const NO_TRANSLATE_LANGUAGE = 'NO'
const LANGUAGES = [
  {
    code: 'EN',
    name: t('english'),
  },
  {
    code: 'DE',
    name: t('german'),
  },
  {
    code: 'PT',
    name: `${t('portuguese')} (${t('brazil')})`,
  },
  {
    code: 'ES',
    name: t('spanish'),
  },
  {
    code: 'UZ',
    name: t('uzbekistan'),
  },
  {
    code: 'EL',
    name: t('greece'),
  },
  {
    code: 'TR',
    name: `${t('turkish')}`,
  },
]
const translatorContextMenuEvent = ref()
const targetTranslationLanguage = ref(NO_TRANSLATE_LANGUAGE)

// Submit
function submit(attachments = false) {
  if ((props.send && isTextValid.value) || attachments) {
    emit('submit', text.value.trim(), {
      files: submittingFiles.value?.map((sf) => ({
        format: sf.fileFormat ? 'file' : 'type-related',
        file: sf.orig,
      })),
      translationLanguage: targetTranslationLanguage.value,
    })
    text.value = ''
    filesModalVisible.value = false
    submittingFiles.value = []
  }
}

// Types
interface SubmittingFile {
  img: string
  name: string
  size: number
  type: 'image' | 'video' | 'audio' | 'other'
  fileFormat: boolean
  orig: File
}

const isImage = (file: DataTransferItem | File) => {
  return file.type.includes('image')
}

const onDragOver = (event: DragEvent) => {
  if (event.dataTransfer && event.dataTransfer.items) {
    let imageInDnd = false
    let resultCount = 0
    for (const item of event.dataTransfer.items) {
      if (item.kind === 'file' && isImage(item)) {
        imageInDnd = true
        resultCount += 1
      }
    }
    if (imageInDnd) {
      showDropZone.value = true
      imagesCount.value = resultCount
    }
  }
}

const onDragLeave = () => {
  showDropZone.value = false
}

const onDrop = (event: DragEvent) => {
  if (!event || !event.dataTransfer || !event.dataTransfer.files) return
  const resultFiles: File[] = []
  for (const file of event.dataTransfer.files) {
    if (isImage(file)) {
      resultFiles.push(file)
    }
  }
  showDropZone.value = false
  if (resultFiles.length > 0) {
    filesModalVisible.value = true
    onFilesSubmit(resultFiles)
  }
}
</script>

<template>
  <div
    class="flex items-end bg-white dark:bg-surface-800 dark:border-surface-700 rounded-md border-solid border border-gray-6 relative"
    :class="[small ? 'min-h-8 px-2 gap-2 text-sm' : 'gap-4 px-4']"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <div
      class="flex items-center justify-center absolute w-full h-full bg-blue left-0 rounded-md bg-opacity-70 pointer-events-none"
      v-if="showDropZone"
    >
      <IconImage name="copy" class="w-6 text-white pointer-events-none" />
      <span class="text-white ml-2 text-sm pointer-events-none">
        Перетяните изображения сюда ({{ imagesCount }})
      </span>
    </div>
    <!-- Files -->
    <template v-if="attachments">
      <FileIconButton
        class="text-gray-400"
        :class="small ? '' : 'mb-5'"
        @submit="onFilesSubmit"
      />
      <Modal v-model:visible="filesModalVisible">
        <div class="flex flex-col gap-4">
          <p class="text-xl font-bold">{{ $t('filesAdding') }}</p>
          <ul class="-ml-5" style="width: calc(100% + 2.5rem)">
            <li
              v-for="file in submittingFiles"
              :class="[
                'flex gap-2 items-center py-2 px-5',
                'hover:bg-primary-500/10',
              ]"
              :key="file.name"
            >
              <!-- thumbnail -->
              <img
                class="w-11 h-11 rounded"
                :src="file.img"
                onerror="this.style.visibility='hidden'"
                onload="this.style.visibility='visible'"
              />
              <!-- info -->
              <div class="flex-1 w-40">
                <p class="line-clamp-1" :title="file.name">
                  {{ file.name }}
                </p>
                <p class="text-sm text-gray-4">
                  {{ formatByteSize(file.size) }}
                </p>
              </div>
              <!-- file format? -->
              <label
                class="shrink-0 flex items-center mr-2 select-none cursor-pointer"
              >
                <Checkbox v-model="file.fileFormat" />&nbsp;{{
                  $t('sendAsFile')
                }}
              </label>
              <!-- remove -->
              <IconButton
                icon="trash"
                class="ml-auto w-5 text-red-600"
                @click="removeFile(file)"
              />
            </li>
          </ul>
          <MessageInput
            v-model="text"
            :small="true"
            :emoji="true"
            :enable-paste="false"
          />
          <div class="flex justify-between">
            <Button
              :label="$t('cancel')"
              :outlined="true"
              theme="gray"
              @click="filesModalVisible = false"
            />
            <Button :label="$t('send')" @click="submit(true)" />
          </div>
        </div>
      </Modal>
    </template>

    <!-- Text area -->
    <ResizebleTextarea
      class="grow border-none outline-none message-textarea"
      :class="small ? 'py-2.5' : 'py-5'"
      v-model="text"
      :placeholder="$t('typeText')"
      @keydown="onKeyDown"
      @paste="onPaste"
    />

    <!-- Tools -->
    <div class="flex gap-4 h-9 text-gray-400" :class="small ? '' : 'mb-3.5'">
      <!-- Emoji -->
      <div class="flex">
        <OverlayPanel
          :event="emojiOPEvent"
          :transparent="true"
          @hide="emojiOPEvent = undefined"
        >
          <EmojiPicker @select="onSelectEmoji" :native="true" />
        </OverlayPanel>
        <IconButton
          v-if="emoji"
          icon="smile"
          :class="emojiOPEvent ? 'text-primary-500' : ''"
          class="w-5"
          @click="
            emojiOPEvent ? (emojiOPEvent = undefined) : (emojiOPEvent = $event)
          "
        />
      </div>
      <!-- Translator -->
      <div
        class="flex items-center gap-1 cursor-pointer select-none hover:opacity-50"
        @click="translatorContextMenuEvent = $event"
      >
        <span
          class="text-primary-500 font-medium"
          v-if="targetTranslationLanguage !== NO_TRANSLATE_LANGUAGE"
          >{{ targetTranslationLanguage }}</span
        >
        <IconButton
          v-if="translator"
          icon="lang-translator"
          :class="[
            'w-5',
            targetTranslationLanguage === NO_TRANSLATE_LANGUAGE
              ? ''
              : 'text-primary-500',
          ]"
        />
      </div>
      <!-- Read -->
      <IconButton v-if="read" icon="eye" class="w-5" @click="emit('read')" />
      <!-- Send -->
      <div
        class="border-l border-gray-6 dark:border-gray-400"
        v-if="send"
      ></div>
      <IconButton
        v-if="send"
        :disabled="!isTextValid"
        icon="paper-plane"
        :class="[
          small ? 'w-4' : 'w-6',
          isTextValid ? 'text-primary-500' : 'text-gray-300 dark:text-gray-600',
        ]"
        @click="submit"
      />
    </div>

    <Menu
      :event="translatorContextMenuEvent"
      :model="[
        {
          label: $t('doNotTranslate'),
          icon: 'pi pi-check',
          command: () => (targetTranslationLanguage = NO_TRANSLATE_LANGUAGE),
          class: {
            'text-primary-500 font-bold':
              targetTranslationLanguage === NO_TRANSLATE_LANGUAGE,
          },
        },
        ...LANGUAGES.map((l) => ({
          label: l.name,
          command: () => (targetTranslationLanguage = l.code),
          class: {
            'text-primary-500 font-bold': targetTranslationLanguage === l.code,
          },
        })),
      ]"
      v-model="targetTranslationLanguage"
      popup
    />
  </div>
</template>

<style lang="scss" scoped>
@media screen and (max-width: 410px) {
  .message-textarea {
    max-width: 180px;
  }
}
@media screen and (max-width: 360px) {
  .message-textarea {
    max-width: 140px;
  }
}
@media screen and (max-width: 350px) {
  .message-textarea {
    max-width: 100px;
  }
}

@media screen and (max-width: 470px) {
  .messanger-files {
    width: 300px;
  }
}
</style>
