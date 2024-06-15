<script setup lang="ts">
import Calendar from 'primevue/calendar'
import IconImage from '@/components/IconImage.vue'

const { placeholder, numberOfMonths } = defineProps<{
  placeholder?: string
  numberOfMonths?: number
}>()

const model = defineModel<
  string | string[] | Date | Date[] | null | undefined
>()
</script>

<template>
  <Calendar
    class="calendar-input"
    v-model="model"
    selection-mode="range"
    show-button-bar
    showIcon
    iconDisplay="input"
    :numberOfMonths="numberOfMonths"
    :placeholder="placeholder"
  >
    <template #inputicon>
      <IconImage name="calendar" class="calendar-input-icon" />
    </template>
  </Calendar>
</template>

<style scoped lang="scss">
.calendar-input-icon {
  position: absolute;
  width: 1rem;
  right: 0.9rem;
  color: #9d9db7;
}
.calendar-input {
  display: flex;
  align-items: center;
  position: relative;
}
</style>
