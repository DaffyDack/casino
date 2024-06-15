import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ClientsData } from '@/models/ClientsData'
import type {
  ClientsStage,
  Player,
  ProfileLine,
  StageFilter,
  LineFilters,
  ClientsFilters,
  ClientsFilters as ClientsFiltersType,
} from '@/models'
import {
  useClientsService,
  type LineResponse,
} from '@/services/clients.service'
import { useNotify } from '@/hooks/notify'
import { isClientsStatusResponse } from '@/typeguards'
import type { Channel, Manager } from '@/stores/chat.store'
import { orderBy, uniq, uniqBy } from 'lodash'

export interface OrderUpdateData {
  id: number
  order: number
}
export const useClientsStore = defineStore('clients', () => {
  const clientsService = useClientsService()
  const clientsSettings = ref(false)
  const clients = ref<ClientsData>()
  const selectPlayers = ref<boolean>(false)
  const selectedPlayers = ref<number[]>([])
  const currentLine = ref<ProfileLine>()
  const fetching = ref(false)
  const page = ref(1)
  const filters = ref<ClientsFiltersType | null>({})
  const notify = useNotify()

  const lineFilters = ref<LineFilters>({
    stages: [],
    managers: [],
    channels: [],
    platforms: [],
    tags: [],
  })

  function setLineData(data: LineResponse) {
    clients.value = sortLineData(data.line)
  }

  function sortByOrder<Type = ClientsStage | Player>(
    data: Type[],
    sortBy = ['order', 'id'],
  ): Type[] {
    return orderBy(data, sortBy, ['asc', 'asc'])
  }

  function sortLineData(data: ClientsData): ClientsData {
    // Sort stages and players
    const { title, id } = data
    console.log('=>(clients.store.ts:76) data.stages', data.stages)
    const stages = sortByOrder(data.stages).map((v) => ({
      ...v,
      players: sortByOrder(v.players, ['id']),
    }))
    return { title, id, stages }
  }

  function getLineFilters(data: ClientsData) {
    const stages: StageFilter[] = []
    let managers: Manager[] = []
    let channels: Channel[] = []
    let platforms: string[] = []
    let resultTags: string[] = []
    if (!data.stages) return
    for (const stage of data.stages) {
      stages.push({ id: stage.id, title: stage.title || 'Без заголовка' })
      for (const player of stage.players) {
        const { resp, channel, platform, tags } = player
        if (resp) {
          managers.push({ ...resp, name: resp.first_name })
        }
        if (channel) {
          channels.push({ id: channel.id, name: channel.title })
        }
        if (platform) {
          platforms.push(platform)
        }
        if (tags) {
          resultTags = resultTags.concat(tags.split(','))
        }
      }
    }

    managers = uniqBy(managers, 'id')
    channels = uniqBy(channels, 'id')
    platforms = uniq(platforms)
    resultTags = uniq(resultTags)

    lineFilters.value = {
      managers,
      platforms,
      stages,
      channels,
      tags: resultTags,
    }
  }
  async function movePlayer(
    player: Player,
    endStageId: number,
    order: number | null = null,
  ) {
    if (clients.value) {
      try {
        await clientsService.updatePlayer(player.id, {
          stage: endStageId,
          order,
        })
        if (currentLine.value) await fetchLine(currentLine.value)
      } catch {
        notify('Ошибка перемещения игрока', 'error')
      }
    }
  }

  async function updatePlayers(updateParams: Partial<Player>) {
    try {
      for (const playerId of selectedPlayers.value) {
        await clientsService.updatePlayer(playerId, updateParams)
      }
      if (currentLine.value) await fetchLine(currentLine.value)
      notify('Игроки обновлены', 'success')
    } catch {
      notify('Ошибка обновления игроков', 'error')
    }
  }

  async function removePlayer(player: Player) {
    try {
      const data = await clientsService.removePlayer(player.id)
      if (isClientsStatusResponse(data) && !data.status) {
        notify(data.messages[0], 'error')
        return
      }
      if (currentLine.value) await fetchLine(currentLine.value)
    } catch {
      notify('Ошибка удаления игрока', 'error')
    }
  }

  async function removePlayers() {
    try {
      for (const playerId of selectedPlayers.value) {
        const data = await clientsService.removePlayer(playerId)
        if (isClientsStatusResponse(data) && !data.status) {
          notify(data.messages[0], 'error')
        }
      }
      selectedPlayers.value = []
      selectPlayers.value = false
      if (currentLine.value) await fetchLine(currentLine.value)
      notify('Игроки удалены', 'success')
    } catch {
      notify('Ошибка удаления игроков', 'error')
    }
  }

  function changePlayersSelection(current: boolean) {
    if (current) {
      const clientsData = clients.value
      if (clientsData) {
        const result = []
        for (const stage of clientsData.stages) {
          for (const player of stage.players) {
            result.push(player.id)
          }
        }
        selectedPlayers.value = result
      }
    } else {
      selectedPlayers.value = []
    }
  }

  function changePlayerSelected(id: number) {
    if (selectedPlayers.value.includes(id)) {
      selectedPlayers.value = selectedPlayers.value.filter((v) => v !== id)
    } else {
      selectedPlayers.value.push(id)
    }
  }
  function changeSelectCheckboxState(state: boolean) {
    selectPlayers.value = state
    selectedPlayers.value = []
  }

  function changeStageColor(stageId: number, color: string) {
    if (!clients.value) return
    const stageIndex = clients.value.stages.findIndex((v) => v.id === stageId)
    clients.value.stages[stageIndex].color = color
  }

  function createStage(
    line: ProfileLine,
    data: Omit<ClientsStage, 'players' | 'robots' | 'id'>,
  ) {
    clientsService
      .createStage({ ...data, line: line.id })
      .then((data) => {
        setLineData(data)
        notify('Статус создан', 'success')
      })
      .catch(() => {
        notify('Не удалось создать статус', 'error')
      })
  }

  function removeStage(stageId: number) {
    clientsService
      .removeStage(stageId)
      .then((data) => {
        if (isClientsStatusResponse(data)) {
          if (!data.status) {
            notify(data.messages[0], 'error')
            return
          }
        } else {
          setLineData(data)
          notify('Статус удален', 'success')
        }
      })
      .catch(() => {
        notify('Не удалось удалить статус', 'error')
      })
  }

  function stageChangeColor(stageId: number, color: string) {
    return clientsService
      .updateStage(stageId, { color })
      .then(() => {
        notify('Цвет статуса изменен', 'success')
      })
      .catch(() => notify('Ошибка при изменении цвета', 'error'))
  }
  function updateStage(stageId: number, data: Partial<ClientsStage>) {
    return clientsService
      .updateStage(stageId, data)
      .then((data) => {
        if (data) {
          setLineData(data)
        }
        notify('Статус обновлен', 'success')
      })
      .catch(() => {
        notify('Ошибка при обновлении статуса', 'error')
      })
  }

  async function updateStagesOrder(data: OrderUpdateData[]) {
    try {
      let response: LineResponse | null = null
      for (const { id, order } of data) {
        response = await clientsService.updateStage(id, { order })
      }
      notify('Позиции обновлены', 'success')
      if (response) {
        setLineData(response)
      }
    } catch {
      notify('Ошибка при обновлении позиций', 'error')
    }
  }
  function updatePlayersSelection(players: Player[]) {
    selectedPlayers.value = players.map((v) => v.id)
  }

  function fetchLine(
    line: ProfileLine | undefined,
    filtersParam: ClientsFilters | null = null,
    pageParam: number = 1,
  ) {
    if (!line) return
    if (fetching.value) return
    fetching.value = true
    filters.value = filtersParam
    return clientsService
      .getLine(line, filtersParam, pageParam)
      .then((data) => {
        const resultLine = data.line
        if (pageParam > 1 && clients.value) {
          const stages = []
          for (let i = 0; i < clients.value?.stages.length; i++) {
            const currentStage = clients.value?.stages[i]
            if (!currentStage) continue
            const resultStage = resultLine.stages.filter(
              (v) => v.id === currentStage?.id,
            )[0]
            resultStage.players = [
              ...currentStage.players,
              ...resultStage.players,
            ]
            stages.push(resultStage)
          }
        }
        page.value = pageParam
        clients.value = sortLineData(resultLine)
        currentLine.value = line
        // TODO: optimize call?
        getLineFilters(data.line)
      })
      .catch(() => {
        notify('Ошибка загрузки линии', 'error')
      })
      .finally(() => setTimeout(() => (fetching.value = false), 200))
  }

  return {
    clients,
    selectPlayers,
    selectedPlayers,
    currentLine,
    lineFilters,
    clientsSettings,
    fetchLine,
    page,
    fetching,
    filters,
    movePlayer,
    changeSelectCheckboxState,
    changePlayerSelected,
    changeStageColor,
    stageChangeColor,
    createStage,
    updateStage,
    updateStagesOrder,
    removeStage,
    removePlayers,
    removePlayer,
    updatePlayers,
    changePlayersSelection,
    updatePlayersSelection,
  }
})
