<script setup lang="ts">
import { useRoute } from 'vue-router'
import IconImage from '@/components/IconImage.vue'
import InputSwitch from 'primevue/inputswitch'
import Breaker from '@/components/Breaker.vue'
import Button from 'primevue/button'
import Avatar from '@/components/Avatar.vue'
import { useUserStore } from '@/stores/user.store'
import { useAuthService } from '@/services/auth.service'
import { useDark, useToggle } from '@vueuse/core'
import { ref, onMounted } from 'vue'

const clientWidth = ref(document.documentElement.clientWidth)

const open = ref(false)
const selectedUsers = ref(true)

const closedMenu = () => {
  if (clientWidth.value < 840) {
    selectedUsers.value = !selectedUsers.value
  }
}

const menuOnClick = () => {
  open.value = !open.value
}

const route = useRoute()
const userStore = useUserStore()
const authService = useAuthService()

function logout() {
  authService.logout().then(() => {
    location.replace('/')
  })
}
const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <nav
    class="bg-gray-1 text-white min-w-72 w-72 md:w-full flex flex-col overflow-hidden"
  >
    <div class="navbar" :class="{ 'navbar--open': selectedUsers }">
      <div class="container nav-container">
        <div class="logo px-4 mt-4 mb-3">
          <div>
            <img src="@/assets/img/logo.png" />
          </div>
          <div class="forMobile" :class="{ open: open }">
            <div class="message"></div>
            <Avatar
              :src="userStore.user?.avatar"
              class="mr-4 menu btn_menu"
              @click="menuOnClick"
              data-menu="4"
            />
            <div>
              <input
                class="checkbox"
                type="checkbox"
                name=""
                id=""
                v-model="selectedUsers"
              />
              <div class="hamburger-lines" :class="{ openMenu: selectedUsers }">
                <span class="line line1"></span>
                <span class="line line3"></span>
              </div>
            </div>
            <div class="menu_list">
              <ul>
                <li>
                  <div class="w-40 flex flex-col items-start">
                    <p class="font-medium truncate">
                      {{ userStore.user?.name }}
                    </p>
                    <p class="opacity-60 truncate">
                      {{ userStore.user?.email }}
                    </p>
                  </div>
                </li>
                <li>$ {{ userStore.user?.balance || 0 }}</li>
                <li>
                  <div
                    class="mt-auto border-solid border-t border-gray-8 flex items-center max-w-full"
                  >
                    <Button
                      text
                      :class="['pl-0 text-white dark:text-white/80']"
                      @click="logout()"
                    >
                      <IconImage name="logout" class="w-4" />
                    </Button>
                    <div>Выход</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="for_summ">
          <div>$ {{ userStore.user?.balance || 0 }}</div>
          <div>
            <div
              class="whitespace-nowrap text-xs cursor-pointer hover:opacity-80 flex items-center"
            >
              <InputSwitch class="mr-2" v-model="isDark" />
              <span class="uppercase select-none" @click="toggleDark()">{{
                $t('darkTheme')
              }}</span>
            </div>
          </div>
        </div>
        <div class="menu-items bg-gray-1" :class="{ openMenu: selectedUsers }">
          <div
            v-for="(section, section_i) in userStore.menu"
            :key="section_i"
            class="flex flex-col gap-1"
          >
            <Breaker v-if="section_i" />
            <span class="flex items-start px-4 text-white/80">{{
              section.header
            }}</span>
            <component
              :is="page.link ? 'a' : 'RouterLink'"
              :to="page.path"
              :href="page.link"
              @click="closedMenu"
              active-class="bg-red-600 cursor-pointer"
              v-for="page in section.pages"
              :key="page.path"
              class="flex flex-row items-center gap-3 py-1 px-4 no-underline text-white select-none cursor-pointer"
            >
              <IconImage
                class="rounded p-px size-6"
                :class="[
                  {
                    'bg-white': route.path === page.path,
                    'border border-gray-8': route.path !== page.path,
                  },
                  route.path === page.path ? 'text-red-600' : 'text-gray-5',
                ]"
                :name="page.icon"
              />
              <span class="font-medium tracking-widest opacity-80 uppercase">{{
                page.label
              }}</span>
              <IconImage
                name="ellipse"
                class="ml-auto w-2"
                v-if="route.path === page.path"
              />
            </component>
          </div>
          <!-- Account menu -->
          <div
            class="avatarForDesctop px-4 py-5 mt-auto border-solid border-t border-gray-8 flex items-center max-w-full"
          >
            <Avatar :src="userStore.user?.avatar" class="mr-4" />
            <div class="w-40 flex flex-col items-start">
              <p class="font-medium truncate mw-100">
                {{ userStore.user?.name }}
              </p>
              <p class="opacity-60 truncate mw-100">
                {{ userStore.user?.email }}
              </p>
            </div>
            <Button
              text
              :class="['ml-auto text-white dark:text-white/80']"
              @click="logout()"
            >
              <IconImage name="logout" class="w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
<style scoped lang="scss">
$dark: #fff;
$light: #efefef;
$color: #b3e5fc;

.mw-100 {
  max-width: 100px;
}
@mixin btn($right, $top) {
  width: 30px;
  height: 30px;
  transition-duration: 0.5s;
}

@mixin icon($height, $width) {
  transition-duration: 0.5s;
  position: absolute;
  height: $height;
  width: $width;
  top: 0px;
  background-color: $dark;
}

@mixin icon-before($height, $width, $top) {
  transition-duration: 0.5s;
  position: absolute;
  width: $width;
  height: $height;
  background-color: $dark;
  content: '';
  top: $top;
}

@mixin icon-after($height, $width, $top) {
  transition-duration: 0.5s;
  position: absolute;
  width: $width;
  height: $height;
  background-color: $dark;
  content: '';
  top: $top;
}

.container {
  max-width: 1050px;
  width: 100%;
  margin: auto;
}

.navbar {
  width: 100%;
  overflow: hidden;
  height: 110px;
  &--open {
    height: 100vh;
  }

  .menu-items {
    display: flex;
    height: calc(100vh - 70px);
    padding-top: 10px;
    transform: translate(-150%);
    display: flex;
    flex-direction: column;
    transition: transform 0.5s ease-in-out;
    text-align: center;

    li {
      margin-bottom: 1.2rem;
      font-size: 1.5rem;
      font-weight: 500;
    }
  }

  .nav-container {
    li {
      list-style: none;
    }

    a {
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      padding: 0.7rem;

      &:hover {
        font-weight: bolder;
      }
    }
  }
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 62px;
  display: block;
  position: relative;
  height: 60px;

  .checkbox {
    position: absolute;
    display: block;
    height: 32px;
    width: 32px;
    z-index: 5;
    opacity: 0;
    cursor: pointer;
  }

  .hamburger-lines {
    display: block;
    height: 13px;
    width: 32px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: height 1s ease;

    &.openMenu {
      height: 25px;
      transition: height 1s ease;
    }

    .line {
      display: block;
      height: 4px;
      width: 100%;
      border-radius: 10px;
      background: #fff;
    }

    .line1 {
      transform-origin: 0% 0%;
      transition: transform 0.4s ease-in-out;
    }

    .line2 {
      transition: transform 0.2s ease-in-out;
    }

    .line3 {
      transform-origin: 0% 100%;
      transition: transform 0.4s ease-in-out;
    }

    &.openMenu {
      .line1 {
        transform: rotate(45deg);
      }

      .line3 {
        transform: rotate(-45deg);
      }
    }
  }

  .menu-items {
    &.openMenu {
      transform: translateX(0);
    }
  }
}

.for_summ {
  display: none;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;

  .forMobile {
    display: none;
    align-items: center;
  }
}

@media (max-width: 840px) {
  nav {
    position: absolute;
    z-index: 999;
    overflow: initial;
  }

  .avatarForDesctop {
    display: none;
  }

  .for_summ {
    display: flex;
    padding: 12px 18px;
    background: #232637;
    border: 1px solid #2d3044;
    border-left: 0;
    border-right: 0;
    justify-content: space-between;
  }

  .bottom_avatar {
    display: none;
  }

  .logo {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    .forMobile {
      display: flex;
      position: relative;

      .btn_menu {
        width: 30px;
        height: 30px;
      }

      .message {
        width: 27px;
        height: 27px;
        background: url(@/assets/icons/Profile/message.svg) no-repeat center;
        background-size: 27px;
        margin-right: 10px;
      }

      .menu_list {
        display: none;
      }

      &.open {
        .menu_list {
          display: block;
          position: absolute;
          right: 0;
          top: 52px;
          background: #2b2f48;
          border: 1px solid #3b4061;
          border-radius: 0 0 5px 5px;
          padding: 0 20px;
          min-width: 190px;
          z-index: 9;

          ul {
            li {
              padding: 10px 0;
              border-bottom: 1px solid #3b4061;

              &:last-child {
                border: none;
              }
            }
          }
        }
      }
    }
  }
}
</style>
