<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Button from '@/components/form/Button.vue'
import InputNumber from 'primevue/inputnumber'
import DepositTable from '@/views/ProfileView/ProfileTabs/DepositTable/DepositTable.vue'
import { useProfileStore } from '@/stores/profile.store'
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user.store'
import { useNotify } from '@/hooks/notify'
import SectionFolder from '@/components/SectionFolder.vue'
import { useProfileService } from '@/services/profile.service'
const { t } = useI18n()
const notify = useNotify()
const profileStore = useProfileStore()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const { financeList } = storeToRefs(profileStore)

enum PLAN_ENUM {
  ANALITICS = 'Аналитика',
  ANALITICS_CRM = 'Аналитика + CRM',
}

const payment = ref(0)
const profileService = useProfileService()
const paymentDisabled = ref(false)
const getPlanData = (userPlan: string | undefined, sectionPlan: PLAN_ENUM) => {
  return {
    root: {
      'bg-red-600 text-white selectedPlan': userPlan === sectionPlan,
      'unselectedPlan text-black': userPlan !== sectionPlan,
    },
    title: {
      'text-white': userPlan === sectionPlan,
      'text-blue': userPlan !== sectionPlan,
    },
    money: {
      'text-white': userPlan === sectionPlan,
      'text-green': userPlan !== sectionPlan,
    },
    label:
      userPlan === sectionPlan
        ? t('profileFinance.youHad')
        : t('profileFinance.want'),
    buttonTheme: userPlan === sectionPlan ? 'white' : 'blue',
  }
}

const firstPlan = computed(() => {
  return getPlanData(user.value?.plan, PLAN_ENUM.ANALITICS)
})

const secondPlan = computed(() => {
  return getPlanData(user.value?.plan, PLAN_ENUM.ANALITICS_CRM)
})
const changePlan = (plan: string) => {
  if (plan === user.value?.plan) {
    return
  }
  userStore.patchUserProfile({ plan }).then(() => {
    notify('Ваш план изменен')
  })
}

const createPayment = () => {
  if (payment.value > 0) {
    paymentDisabled.value = true
    profileService.createPayment(payment.value).then((data) => {
      paymentDisabled.value = false
      window.location.replace(data.url)
    })
  }
}

onMounted(() => {
  profileStore.getFinanceList()
})
</script>

<template>
  <div class="border w-full finance">
    <p class="mt-4 flex flex-col px-4 mb-2 font-bold text-lg">
      {{ t('profileFinance.tariffs') }}
    </p>
    <div class="flex gap-4 px-4 pb-4 md:flex-col">
      <div
        class="border flex flex-col items-center px-4 w-1/2 md:w-full lg:w-full"
        :class="firstPlan.root"
      >
        <p class="text-center mt-3" :class="firstPlan.title">Аналитика</p>

        <p class="py-4">$59 / {{ t('profileFinance.month') }}</p>

        <p class="p-4 w-5/6 text-center">
          <span class="text-green" :class="firstPlan.money">+ $0.8</span>
          {{ t('profileFinance.deposit') }}
        </p>

        <ul class="self-start flex-grow w-full mb-6">
          <li class="border-t py-1.5">{{ t('profileFinance.analytics') }}</li>
          <li class="border-t py-1.5">{{ t('profileFinance.mailing') }}</li>
          <li class="border-t border-b py-1.5">
            {{ t('profileFinance.buyers') }}
          </li>
        </ul>

        <Button
          class="justify-center mt-auto self-end place-content-end text-black w-full mb-5"
          :label="firstPlan.label"
          :theme="firstPlan.buttonTheme"
          @click="changePlan(PLAN_ENUM.ANALITICS)"
        />
      </div>

      <div
        class="border flex flex-col items-center px-4 w-1/2 md:w-full"
        :class="secondPlan.root"
      >
        <p class="text-center mt-3" :class="secondPlan.title">
          Аналитика + CRM
        </p>

        <p class="py-4">$349 / {{ t('profileFinance.month') }}</p>

        <p class="p-4 w-5/6 text-center">
          <span :class="secondPlan.money">+ $0.8</span>
          {{ t('profileFinance.deposit') }}
        </p>

        <ul class="self-start w-full flex-grow mb-6">
          <li class="border-t py-1.5">{{ t('profileFinance.analytics') }}</li>
          <li class="border-t py-1.5">{{ t('profileFinance.mailing') }}</li>
          <li class="border-t py-1.5">FB API Conversion</li>
          <li class="border-t py-1.5">
            CRM {{ t('profileFinance.qualityControl') }}
          </li>
          <li class="border-t py-1.5">{{ t('profileFinance.buyers') }}</li>
          <li class="border-t border-b py-1.5">
            {{ t('profileFinance.managers') }}
          </li>
        </ul>

        <Button
          class="grow mt-auto justify-center w-full mb-5"
          :label="secondPlan.label"
          :theme="secondPlan.buttonTheme"
          @click="changePlan(PLAN_ENUM.ANALITICS_CRM)"
        />
      </div>
    </div>

    <div class="p-4 mt-4 gap-4 flex relative items-center">
      <label class="absolute top-[-10px] left-4 text-gray-16">{{
        t('profileFinance.replenishment')
      }}</label>
      <InputNumber
        class="summ grow w-full h-12 pl-14"
        inputId="currency-us"
        mode="currency"
        currency="USD"
        locale="en-US"
        v-model="payment"
      />

      <Button
        class="grow h-12 justify-center"
        :label="t('profileFinance.replenish')"
        theme="red"
        @click="createPayment"
      />
    </div>

    <div class="border m-4">
      <DepositTable :deposits="financeList" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.unselectedPlan {
  ul {
    li {
      background: url(@/assets/icons/Profile/arrowBlueRight.svg) no-repeat
        center right 10px;
    }
  }
}
.selectedPlan {
  ul {
    li {
      background: url(@/assets/icons/Profile/arrowWhiteRight.svg) no-repeat
        center right 10px;
    }
  }
}
.summ {
  background: url(@/assets/icons/Profile/Icon3.svg) no-repeat center left 16px;
}
</style>
