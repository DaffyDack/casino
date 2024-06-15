<script lang="ts" setup>
import Checkbox from 'primevue/checkbox'
import { usePassThrough } from 'primevue/passthrough'

interface PassThroughArguments {
  context: {
    disabled: boolean
    checked: boolean
  }
}

const props = defineProps({
  alternateStyle: {
    default: false,
  },
})
</script>

<template>
  <Checkbox
    :pt="
      usePassThrough(
        {
          root: ({ context }: PassThroughArguments) => ({
            class: [
              'w-4 h-4 rounded border border-primary-500 inline-block',
              {
                'bg-primary-500 ': context.checked,
                'border-gray-4': context.disabled,
                'bg-gray-4': context.disabled && context.checked,
              },
            ],
          }),
          box: {
            class: 'relative',
          },
          input: {
            class: ['hidden'],
          },
          icon: ({ context }: PassThroughArguments) => ({
            class: [
              'absolute -top-px -left-px scale-50',
              context.disabled ? 'text-black' : 'text-white',
            ],
          }),
        },
        alternateStyle
          ? {
              root: ({ context }: PassThroughArguments) => ({
                class: [
                  'w-4 h-4 rounded border border-white inline-block',
                  {
                    'bg-white ': context.checked,
                    'border-gray-4': context.disabled,
                    'bg-gray-4': context.disabled && context.checked,
                  },
                ],
              }),
              icon: ({ context }: PassThroughArguments) => ({
                class: [
                  'absolute -top-px -left-px scale-50',
                  context.disabled ? 'text-black' : '!text-primary-500',
                ],
              }),
            }
          : {},
        {},
      )
    "
    :binary="true"
  />
</template>
