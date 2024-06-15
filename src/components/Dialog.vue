<script setup>
import Button from '@/components/form/Button.vue'
import InputText from '@/components/form/InputText.vue'
import Dialog from 'primevue/dialog'
const props = defineProps({
  title: {
    default: 'test',
  },
  visible: {
    default: false,
  },
  placeholder: {
    default: 'test',
  },
  label: {
    default: 'OK',
  },
  breakpoints: {
    default: {},
  },
})
</script>
<template>
  <div class="card flex justify-center">
    <Dialog
      v-model:visible="props.visible"
      modal
      header="Header"
      :style="{ width: '50rem', background: 'white' }"
      :breakpoints="props.breakpoints"
    >
      <template #header>
        <div class="inline-flex items-center justify-center gap-2">
          <span class="font-bold whitespace-nowrap">{{ props.title }}</span>
        </div>
      </template>
      <InputText class="w-full" :placeholder="props.placeholder" />
      <template #footer>
        <div class="flex flex-col items-stretch w-full">
          <Button
            class="flex justify-center"
            :label="props.label"
            icon="pi pi-check"
            v-on:click="$emit('click', $event)"
            autofocus
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>
