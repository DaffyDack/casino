<script lang="ts" setup>
import MultiSelect from 'primevue/multiselect'
</script>

<template>
  <MultiSelect
    :placeholder="`${$t('select_imperative')}...`"
    filter-match-mode="multilanguage-contains"
  />
</template>
