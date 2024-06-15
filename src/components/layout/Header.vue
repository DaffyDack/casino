<script setup lang="ts">
import InputSwitch from 'primevue/inputswitch'
import IconImage from '@/components/IconImage.vue'
import { useDark, useFullscreen, useToggle } from '@vueuse/core'
import { useUserStore } from '@/stores/user.store'
import { useRoute } from 'vue-router'
import { RouteNames } from '@/router'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
const userStore = useUserStore()

const props = defineProps({
  title: {
    type: String,
  },
  prevRoute: {},
})

const route = useRoute()
const { t } = useI18n()

// Views titles
const viewsTitles = Object.values(RouteNames).reduce<Record<string, string>>(
  (acc, name) => ({ ...acc, [name]: t(`${name}ViewTitle`) }),
  {},
)

// Fullscreen
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

// Dark theme
const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <header>
    <div
      v-if="true"
      class="h-10 flex items-center gap-5 py-2 px-4 justify-end bg-gray-1 text-white border-solid border border-gray-8 border-t-0 border-r-0"
    >
      <div>$ {{ userStore.user?.balance || 0 }}</div>
      <div class="bg-red-600 rounded flex p-1 cursor-pointer hover:opacity-80">
        <IconImage name="bell" class="w-5 text-white" />
      </div>
    </div>
    <div
      class="forMobile h-12 flex items-center py-2 px-4 gap-4 bg-gray-9 text-white border-solid border border-gray-8 border-t-0 border-r-0"
    >
      <RouterLink
        :class="['hidden md:inline-block']"
        :to="prevRoute ?? { name: RouteNames.Home }"
      >
        <IconImage class="w-2" name="angle-left" />
      </RouterLink>
      <div class="grow font-bold text-2xl">
        {{
          title ??
          (typeof route.name === 'string' ? viewsTitles[route.name] : '')
        }}
      </div>
      <!-- Dark theme -->
      <div
        class="whitespace-nowrap text-xs cursor-pointer hover:opacity-80 flex items-center"
      >
        <div class="specialSwitch flex">
          <input type="checkbox" id="switch" v-model="isDark" /><label
            for="switch"
          ></label>
        </div>
        <span class="uppercase select-none" @click="toggleDark()">{{
          $t('darkTheme')
        }}</span>
      </div>
      <!-- Fullscreen -->
      <div
        :class="[
          'md:hidden',
          'whitespace-nowrap text-xs cursor-pointer hover:opacity-80 flex items-center',
        ]"
        @click="toggleFullscreen()"
      >
        <IconImage class="mr-2 w-4" name="full" />
        <span class="uppercase select-none">{{
          isFullscreen ? $t('exitFullscreen') : $t('enterFullscreen')
        }}</span>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.specialSwitch {
  margin-right: 5px;

  input[type='checkbox'] {
    height: 0;
    width: 0;
    visibility: hidden;

    & + label {
      cursor: pointer;
      text-indent: -9999px;
      width: 31px;
      height: 17px;
      background: grey;
      display: block;
      border-radius: 100px;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 1px;
        left: 1px;
        width: 15px;
        height: 15px;
        background: #fff;
        border-radius: 90px;
        transition: 0.3s;
      }
    }

    &:checked {
      & + label {
        background: #5ea5fa;

        &:after {
          background: #000;
          left: calc(100% - 1px);
          transform: translateX(-100%);
        }
      }
    }
  }
}

@media (max-width: 840px) {
  .forMobile {
    display: none;
  }
}
</style>
