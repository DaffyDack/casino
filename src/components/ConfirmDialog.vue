<script lang="ts" setup>
import Modal from '@/components/Modal.vue'
import { ref, watch } from 'vue'
import Button from 'primevue/button'
import IconImage from './IconImage.vue'

const props = defineProps<{
  header?: string
  text?: string
  accept?: Function
  acceptAttrs?: Object
  cancelAttrs?: Object
  onShow?: Function
  onHide?: Function
}>()

// Visibility
const visible = ref(false)
watch(visible, (visible, prev) => {
  if (visible === prev) return
  if (visible) {
    props.onShow && props.onShow()
  } else {
    props.onHide && props.onHide()
  }
})
const show = () => {
  console.log(1)
  visible.value = true
}
const hide = () => {
  visible.value = false
}
const toggle = () => {
  visible.value = !visible.value
}

// Accept/cancel
function accept() {
  Promise.resolve(props.accept ? props.accept() : null).then(() => {
    visible.value = false
  })
}
function cancel() {
  visible.value = false
}

// Expose methods for access through $ref
defineExpose({
  show,
  hide,
  toggle,
})
</script>

<template>
  <Modal v-model:visible="visible">
    <p class="text-2xl">{{ header }}</p>
    <p class="text-lg my-4" v-if="text">
      {{ text }}
    </p>
    <slot :accept="accept" :cancel="cancel">
      <div class="flex justify-end gap-2">
        <Button v-bind="cancelAttrs" @click="cancel()" />
        <Button v-bind="acceptAttrs" @click="accept()" />
      </div>
    </slot>
  </Modal>
</template>
