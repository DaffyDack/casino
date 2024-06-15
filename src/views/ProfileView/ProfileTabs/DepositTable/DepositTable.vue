<script setup lang="ts">
import DataTable, {
  type DataTableRowContextMenuEvent,
} from 'primevue/datatable'
import Column from 'primevue/column'
import { ref } from 'vue'
import type { FinanceTransaction, UserDeposit } from '@/models'
import { DateTime } from 'luxon'

const props = defineProps<{
  deposits: FinanceTransaction[]
}>()

const selectedRows = ref()
const selectedRow = ref<UserDeposit>()
const formatDate = (date: string) => {
  return DateTime.fromISO(date).toFormat('dd.MM.yyyy HH:mm')
}
const formatStatus = (status: UserDeposit['status']): string => {
  switch (status) {
    case 'process':
      return 'В прооцессе'
    case 'cancel':
      return 'Отменён'
    case 'done':
      return 'Зачислен'

    default:
      return status
  }
}
</script>

<template>
  <div class="overflow-x-hidden">
    <DataTable
      :value="props.deposits"
      v-model:selection="selectedRows"
      stripedRows
      sort-mode="multiple"
      paginator
      :rows="5"
      class="w-full table"
      v-model:context-menu-selection="selectedRow"
      highlight-on-select
    >
      <Column header="ID" :sortable="true" field="id" />
      <Column header="Назначение" :sortable="true" field="type">
        <template #body="slotProps">
          {{
            `${slotProps.data.description} (${formatStatus(slotProps.data.status)})`
          }}
        </template>
      </Column>
      <Column header="Дата" :sortable="true" field="date">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.created_at) }}
        </template>
      </Column>
      <Column header="Сумма $" :sortable="true" field="amount">
        <template #body="slotProps">
          <span class="font-medium"> ${{ slotProps.data.amount }} </span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped lang="scss"></style>
