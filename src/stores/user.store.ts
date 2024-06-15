import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useChatService } from '@/services/chat.service'
import type { ProfileLine, UserProfile } from '@/models'
import type { Channel, Manager, Platform, Stage } from '@/stores/chat.store'
import { useProfileService } from '@/services/profile.service'

export const useUserStore = defineStore('user', () => {
  const chatService = useChatService()
  const profileService = useProfileService()

  const authed = ref<boolean>()
  const user = ref<UserProfile>()
  const menu = ref<Awaited<ReturnType<typeof chatService.getProfile>>['menu']>(
    [],
  )
  const lines = ref<ProfileLine[]>([])
  // Filters
  const channels = ref<Channel[]>()
  const platforms = ref<Platform[]>()
  const managers = ref<Manager[]>()
  const stages = ref<Stage[]>()
  function getFilters() {
    profileService.getFilters().then((data) => {
      channels.value = data.channels.map((c) => ({
        id: c.id,
        name: c.name_channel,
      }))
      platforms.value = data.platforms.map((p) => ({
        name: p,
      }))
      managers.value = data.responsible.map((r) => ({
        id: r.id,
        name: r.first_name,
        username: r.username,
      }))
      console.log({ channels, platforms, managers })
      console.log('=>(user.store.ts:24) stages.value', stages.value)
    })
  }

  function getStages() {
    profileService.getStages().then((data) => {
      stages.value = data.map((s) => ({
        id: s.id,
        ignore: s.ignore,
        standart: s.standart,
        title: s.title,
      }))
    })
  }

  function patchUserProfile(user: Partial<UserProfile>) {
    return chatService.patchProfile(user).then((res) => {
      if (res.status) {
        fetchData()
      }
    })
  }

  function fetchData() {
    chatService
      .getProfile()
      .then((profile) => {
        if (!profile.status) throw new Error('Not authed')
        console.log('=>(user.store.ts:22) profile', profile)
        authed.value = true
        user.value = profile
        menu.value = profile.menu
        lines.value = profile.lines
      })
      .catch(() => {
        if (authed.value === undefined) {
          authed.value = false
        }
      })
  }

  // Init
  fetchData()

  return {
    // Data
    authed,
    user,
    menu,
    platforms,
    stages,
    channels,
    lines,
    managers,
    // Actions
    fetchData,
    getFilters,
    getStages,
    patchUserProfile,
  }
})
