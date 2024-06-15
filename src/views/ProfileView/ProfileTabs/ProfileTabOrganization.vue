<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import InputText from '@/components/form/InputText.vue'
import Button from '@/components/form/Button.vue'
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user.store'
import { storeToRefs } from 'pinia'
import { useProfileService } from '@/services/profile.service'
import { useProfileStore } from '@/stores/profile.store'
import { useNotify } from '@/hooks/notify'
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const { t } = useI18n()

const profileService = useProfileService()
const profileStore = useProfileStore()
const notify = useNotify()
const { shiftList } = storeToRefs(profileStore)

const fields = computed(() => {
  return [
    {
      field: 'Ваша ссылка на регистрацию для работников отдела качества:',
      link: `https://mvpproject.io/register/quality/${user.value?.code}/`,
    },
    {
      field: 'Ваша ссылка на регистрацию для баеров:',
      link: `https://mvpproject.io/register/buyer/${user.value?.code}/`,
    },
    {
      field: 'Ваша ссылка на регистрацию для менеджеров:',
      link: `https://mvpproject.io/register/manager/${user.value?.code}/`,
    },
  ]
})

const workers = ref([
  {
    name: 'Artur',
    email: 'markmx@mvpproject.com',
    data: 'Янв 25, 2024 - 19:50',
  },
  {
    name: 'Artur',
    email: 'markmx@mvpproject.com',
    data: 'Янв 25, 2024 - 19:50',
  },
  {
    name: 'Artur',
    email: 'markmx@mvpproject.com',
    data: 'Янв 25, 2024 - 19:50',
  },
  {
    name: 'Artur',
    email: 'markmx@mvpproject.com',
    data: 'Янв 25, 2024 - 19:50',
  },
])

const updateCode = () => {
  profileService.updateCode().then((data) => {
    if (user.value) {
      user.value.code = data.code
    }
  })
}

const closeShift = (id: number) => {
  profileService.closeShift(id).then(() => {
    notify('Смена закрыта!')
    profileStore.getShiftsList()
  })
}

onMounted(() => {
  profileStore.getShiftsList()
})
</script>

<template>
  <div class="wrapper">
    <div class="border">
      <p class="mt-4 flex flex-col px-4 mb-2 font-bold text-lg">
        {{ t('profileOrganization.organization') }}
      </p>

      <div class="flex flex-col mx-3 mb-4 my- gap-x-2.5 organizations">
        <ul class="w-[100%]">
          <li
            v-for="field in fields"
            class="flex justify-between md:flex-col"
            :key="field.field"
          >
            <div>{{ field.field }}</div>
            <div class="link">
              <a href="{{field.link}}">{{ field.link }}</a>
            </div>
          </li>
        </ul>
        <Button
          :label="t('profileOrganization.updateCode')"
          class="justify-center"
          theme="red"
          @click="updateCode"
        />
      </div>
    </div>
    <div class="border">
      <p class="mt-4 flex flex-col px-4 mb-2 font-bold text-lg">
        {{ t('profileOrganization.shifts') }}
      </p>

      <div class="mx-3 mb-4 gap-x-2.5">
        <ul class="workers">
          <li v-for="work in shiftList" class="flex flex-col" :key="work.id">
            <span class="indicator">
              <div></div>
            </span>
            <div class="name">{{ work.first_name }}({{ work.username }})</div>
            <div class="data capitalize">
              {{ t('profileOrganization.startDate') }}: {{ work.textDate }}
            </div>
            <Button
              :label="t('profileOrganization.close')"
              class="justify-center mt-2"
              theme="white"
              @click="closeShift(work.id)"
            />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  background: #f1f6f9;
}

.border {
  margin-bottom: 15px;
  background: white;

  .workers {
    display: grid;
    gap: 15px;
    grid-template-columns: repeat(3, minmax(0, 1fr));

    li {
      border-radius: 4px;
      border: 1px solid #d7d8dc;
      padding: 10px 12px;
      background: #3575e6;

      .indicator {
        div {
          margin-bottom: 5px;
          width: 15px;
          height: 15px;
          border-radius: 100%;
          border: 2px solid white;
          background: #26b72c;
        }
      }

      .name {
        color: white;
      }

      .data {
        color: white;
        opacity: 80%;
      }
    }
  }
}

.organizations {
  padding-left: 4px;

  .link {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  ul {
    li {
      border-radius: 4px;
      border: 1px solid #d7d8dc;
      padding: 10px 35px 10px 12px;
      margin-bottom: 10px;
      background: url('@/assets/icons/link.svg') no-repeat top 50% right 10px;
      background-size: 12px;

      a {
        color: #3575e6;

        &:hover {
          color: #6a97e6;
        }
      }
    }
  }
}

@media (max-width: 840px) {
  .organizations {
    ul {
      li {
        background: url('@/assets/icons/link.svg') no-repeat top 19px right 10px;
      }
    }
  }

  .border {
    .workers {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }
}
</style>
