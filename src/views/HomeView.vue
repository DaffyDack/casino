<script lang="ts" setup>
import { RouteNames } from '@/router'
import { useRouter } from 'vue-router'

const router = useRouter()

if (window.innerWidth > 840) {
  router.push({ name: RouteNames.Messenger })
}
</script>

<template></template>
