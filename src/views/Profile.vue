<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted, ref } from 'vue'
import ProfileTabMain from '@/views/ProfileView/ProfileTabs/ProfileTabMain.vue'
import ProfileTabSafety from '@/views/ProfileView/ProfileTabs/ProfileTabSafety.vue'
import ProfileTabFinance from '@/views/ProfileView/ProfileTabs/ProfileTabFinance.vue'
import ProfileTabOrganization from '@/views/ProfileView/ProfileTabs/ProfileTabOrganization.vue'
import ProfileTabStaff from '@/views/ProfileView/ProfileTabs/ProfileTabStaff.vue'
import ProfileTabConnection from '@/views/ProfileView/ProfileTabs/ProfileTabConnection.vue'

import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Dropdown from 'primevue/dropdown'
import { useUserStore } from '@/stores/user.store'
const { t } = useI18n()

const active = ref(0)
const selectedValue = ref(null)
const userStore = useUserStore()
const tabs = ref([
  { title: 'basicData', content: 'Content', componentName: ProfileTabMain },
  { title: 'safety', content: 'Content', componentName: ProfileTabSafety },
  { title: 'finance', content: 'Content', componentName: ProfileTabFinance },
  {
    title: 'organization',
    content: 'Content',
    componentName: ProfileTabOrganization,
  },
  { title: 'staff', content: 'Content', componentName: ProfileTabStaff },
  {
    title: 'communicationChannel',
    content: 'Content',
    componentName: ProfileTabConnection,
  },
])

const nodes = ref([
  {
    key: '0',
    label: 'Основные данные',
    icon: 'pi pi-fw pi-inbox',
  },
  {
    key: '1',
    label: 'Безопасность',
    icon: 'pi pi-fw pi-inbox',
  },
  {
    key: '2',
    label: 'Финансы',
    icon: 'pi pi-fw pi-inbox',
  },
  {
    key: '3',
    label: 'Организация',
    icon: 'pi pi-fw pi-inbox',
  },
  {
    key: '4',
    label: 'Сотрудники',
    icon: 'pi pi-fw pi-inbox',
  },
  {
    key: '5',
    label: 'Канал связи',
    icon: 'pi pi-fw pi-inbox',
  },
])
const selectAction = (e: any) => {
  active.value = +e.value.id
}

const countries = ref([
  { id: '0', name: t('basicData'), code: '1' },
  { id: '1', name: t('safety'), code: '2' },
  { id: '2', name: t('finance'), code: '3' },
  { id: '3', name: t('organization'), code: '4' },
  { id: '4', name: t('staff'), code: '5' },
  { id: '5', name: t('communicationChannel'), code: '6' },
])

onMounted(() => {
  userStore.fetchData()
})
</script>

<template>
  <div class="flex specialStyleMenu">
    <div class="card">
      <div class="flex mb-2 gap-2 justify-end miniSize">
        <ThemeSwitcher />
        <div class="card flex justify-center">
          <Dropdown
            v-model="selectedValue"
            @change="selectAction($event)"
            :options="countries"
            optionLabel="name"
            :placeholder="countries[0].name"
            class="w-full md:w-[100%] h-[43px] items-center"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center">
                <img
                  :alt="slotProps.value.label"
                  src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png"
                  :class="`mr-2 flag flag-${slotProps.value.code.toLowerCase()}`"
                  style="width: 20px; height: 15px"
                />
                <div>{{ slotProps.value.name }}</div>
              </div>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
            <template #option="slotProps">
              <div class="flex items-center">
                <img
                  :alt="slotProps.option.label"
                  src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png"
                  :class="`mr-2 flag flag-${slotProps.option.code.toLowerCase()}`"
                  style="width: 20px; height: 15px"
                />
                <div>{{ slotProps.option.name }}</div>
              </div>
            </template>
          </Dropdown>
        </div>
      </div>
      <TabView class="wrapperMenuTab" v-model:activeIndex="active">
        <TabPanel v-for="tab in tabs" :key="tab.title" :header="$t(tab.title)">
          <component :is="tab.componentName" class="component"></component>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<style lang="scss">
@for $i from 1 through 6 {
  .flag.flag-#{$i} {
    background: url(@/assets/icons/Profile/Icon#{$i}.svg) no-repeat center;
    background-size: 12px;
  }
}

.specialStyleMenu {
  padding: 10px;

  .miniSize {
    display: none;
  }

  .card {
    width: 100%;

    .wrapperMenuTab {
      display: flex;
      flex-direction: row;

      div[data-pc-section]:first-child {
        position: relative;

        ul {
          display: flex;
          flex-direction: column;
          min-width: 250px;
          margin-right: 10px;
          background: #fff;
          padding: 46px 10px 10px 10px;
          border: 1px solid #d7d8dc;
          position: relative;

          &::after {
            content: 'Параметры профиля';
            position: absolute;
            top: 15px;
            left: 11px;
            font-weight: 700;
            font-size: 16px;
          }

          li {
            margin-bottom: 10px;
            background: #fff;
            border-radius: 4px;
            border: 1px solid #d7d8dc;

            @for $i from 1 through 6 {
              &:nth-child(#{$i}) {
                background: url(@/assets/icons/Profile/Icon#{$i}.svg)
                  no-repeat
                  left
                  13px
                  center;
                background-size: 15px;
              }
            }

            &[data-p-active='true'] {
              border: none;

              @for $i from 1 through 6 {
                &:nth-child(#{$i}) {
                  background: url(@/assets/icons/Profile/IconWhite#{$i}.svg)
                    no-repeat
                    left
                    13px
                    center
                    #3575e6;
                  background-size: 15px;
                }
              }

              a {
                color: #fff;
                background-color: transparent;
              }
            }

            &:last-child {
              border: none;
            }

            a {
              border: none;
              border-radius: 4px;
              padding-left: 40px;
              color: #74757b;

              &:hover {
                background-color: transparent;
              }
            }
          }
        }
      }

      div[data-pc-section]:last-child {
        width: 100%;

        > div {
          padding: 0;
        }
      }
    }
  }

  @media (max-width: 840px) {
    .miniSize {
      display: flex;
      flex-direction: column;

      .wrapSelect {
        width: 100%;

        > div {
          width: 100%;
          height: 40px;
          display: flex;
          align-items: center;
          padding-left: 30px;
        }
      }
    }

    .card {
      width: 100%;

      .wrapperMenuTab {
        display: flex;
        flex-direction: column;

        div[data-pc-section]:first-child {
          ul {
            display: none;
          }
        }
      }
    }
  }
}
</style>
