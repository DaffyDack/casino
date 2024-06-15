<script lang="ts" setup>
import { computed } from 'vue'
import { ref } from 'vue'
import { useSlots } from 'vue'

const props = defineProps({
  lazy: {
    default: true, // todo: false
  },
})

const slots = useSlots()
const tabs = slots.default ? [...slots.default()] : []
const selectedTabPanel = ref(tabs[0])

const activeTabIndex = ref(0)
const activeTab = computed(() => tabs[activeTabIndex.value])
</script>

<template>
  <div>
    <nav>
      <ul class="flex justify-around">
        <li
          v-for="(tab, index) in tabs"
          @click="activeTabIndex = index"
          :class="[
            'cursor-pointer grow text-center p-2 rounded text-sm',
            activeTabIndex === index
              ? 'bg-gray-1 text-white'
              : 'bg-gray-11 text-gray-2',
          ]"
        >
          {{ tab.props?.header }}
        </li>
      </ul>
    </nav>
    <div>
      <template v-for="(tab, index) in tabs" :key="index">
        <div
          v-if="lazy ? activeTabIndex === index : true"
          v-show="lazy ? true : activeTabIndex === index"
        >
          <component :is="activeTab"></component>
        </div>
      </template>
    </div>
  </div>
</template>
