<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Button from '@/components/form/Button.vue'
import InputText from '@/components/form/InputText.vue'
import FileUploader from '@/components/form/FileUploaderView.vue'
import TextEditor from '@/components/form/TextEditor.vue'
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import SelectButton from 'primevue/selectbutton'

const timeGenerator = (num: number) => {
  return Array.from({ length: num }, (e, i) => {
    return { name: ++i }
  })
}

const { t } = useI18n()
const searchValue = ref(null)
const popUpStatus = ref(false)
const name = ref('')
const selectedValueMenu = ref('')
const action = ref('')
const selectedOnOff = ref()
const selectedEntity = ref({ code: false })
const selectedCondition = ref()
const valueTag = ref(null)
const valueTextarea = ref()
const choosingEntity = ref()
const selectedDateCompletionTask = ref()
const selectedNameTask = ref()

const optionsTag = ref([
  { name: 'Option 1', value: 1 },
  { name: 'Option 2', value: 2 },
  { name: 'Option 3', value: 3 },
])
const menuActions = ref([
  {
    action: 'Отправка сообщения при регистрации и депозите',
    name: 'Отправить сообщение',
    value: 'message',
  },
  { action: 'Действие', name: 'Перевести на стадию', value: 'transfer' },
  { action: 'Действие', name: 'Изменить теги', value: 'changeTags' },
  { action: 'Действие', name: 'Изменить поле', value: 'changeField' },
  { action: 'Действие', name: 'Добавить задачу', value: 'addTask' },
  { action: 'Действие', name: 'Отправить постбэк', value: 'sendPostback' },
  {
    action: 'Действие',
    name: 'Отправить уведомление',
    value: 'sendNotification',
  },
])

const selectedMinutes = ref()
const minutes = ref(timeGenerator(60))
const selectedHours = ref()
const hours = ref(timeGenerator(24))
const selectedDays = ref()
const days = ref(timeGenerator(31))

const menuConstructions = ref([{ name: 'Условие', value: '' }])
const dateCompletionTask = ref([
  { name: 'Через час', value: '' },
  { name: 'Через 1 день', value: '' },
])
const nameTask = ref([
  { name: 'Задача 1', value: '' },
  { name: 'Задача 2', value: '' },
])
const optionsOffOn = ref([
  { name: 'Включен', code: '' },
  { name: 'Выключен', code: '' },
])

const entity = ref([
  { name: 'Регистрация', code: false },
  { name: 'Авторизация', code: false },
  { name: 'Нет сообщения от клиента', code: true },
])
const entity2 = ref([
  { name: 'Игнор', code: false },
  { name: 'Отправленна ссылка', code: false },
  { name: 'Ведем общение', code: true },
])
const condition = ref([
  { name: 'И', code: '' },
  { name: 'ИЛИ', code: '' },
])

const selectMenu = (e: any) => {
  name.value = e.name
  selectedValueMenu.value = e.value
  action.value = e.action
  popUpStatus.value = true
}
const addCondition = () => {
  popUpStatus.value = false
  selectedValueMenu.value = ''
  action.value = ''
}
</script>

<template>
  <div class="players flex flex-col w-full clients-controls">
    <div class="nameRobot">
      <label for="saveNameRobot" class="">{{
        $t('palyersViwe.nameRobots')
      }}</label>
      <div id="saveNameRobot" class="flex gap-3 mt-2">
        <InputText
          disabled
          class="grow max-w-72"
          :placeholder="$t('palyersViwe.nameRobots')"
        />
        <Button :label="$t('save')" icon="pi pi-prime" />
      </div>
    </div>
    <div class="menu">
      <label for="actions">{{ $t('palyersViwe.actions') }}</label>
      <ul id="actions">
        <li
          v-for="(item, index) in menuActions"
          :class="{ openMenu: item.value == selectedValueMenu && popUpStatus }"
          :key="index"
          @click="selectMenu(item)"
        >
          {{ item.name }}
        </li>
      </ul>
      <label for="constructions">{{ $t('palyersViwe.constructions') }}</label>
      <ul id="constructions">
        <li v-for="(item, index) in menuConstructions" :key="index">
          {{ item.name }}
        </li>
      </ul>
    </div>
  </div>
  <Dialog
    v-model:visible="popUpStatus"
    header="Confirm"
    :modal="true"
    class="min-w-[800px] bg-white"
  >
    <template #header>
      <div class="inline-flex align-items-center justify-content-center gap-2">
        <span class="font-bold white-space-nowrap">{{ name }}</span>
      </div>
    </template>
    <div class="confirmation-content headerAction">
      <div class="nameAction">
        <label for="">Название действия:</label>
        <div class="nameActionInner">{{ action }}</div>
      </div>
      <div v-if="selectedValueMenu != 'transfer'">
        <label for="">Выбор сущности:</label>
        <Dropdown
          v-model="selectedEntity"
          :options="entity"
          optionLabel="name"
          placeholder="Выбор сущности"
          class="entityActionInner w-full md:w-14rem"
        />
      </div>
      <div
        class="time"
        v-if="selectedValueMenu == 'message' && selectedEntity.code"
      >
        <div>
          <label for="">Минуты</label>
          <Dropdown
            v-model="selectedMinutes"
            :options="minutes"
            optionLabel="name"
            placeholder="Минуты"
            class="w-full md:w-14rem"
          />
        </div>
        <div>
          <label for="">Часы</label>
          <Dropdown
            v-model="selectedHours"
            :options="hours"
            optionLabel="name"
            placeholder="Часы"
            class="w-full md:w-14rem"
          />
        </div>
        <div>
          <label for="">Дни</label>
          <Dropdown
            v-model="selectedDays"
            :options="days"
            optionLabel="name"
            placeholder="Дни"
            class="w-full md:w-14rem"
          />
        </div>
      </div>
      <div>
        <label for="">Выбор условия:</label>
        <Dropdown
          v-model="selectedCondition"
          :options="condition"
          optionLabel="name"
          placeholder="Выбор условия"
          class="conditionActionInner w-full md:w-14rem"
        />
      </div>
      <div>
        <Button
          class="w-full flex justify-center bg-red-600"
          :label="$t('palyersViwe.addAction')"
          icon="pi pi-save"
          text
        />
      </div>
      <div
        v-if="
          selectedValueMenu == 'changeField' ||
          selectedValueMenu == 'message' ||
          selectedValueMenu == 'sendPostback' ||
          selectedValueMenu == 'sendNotification'
        "
      >
        <label for="">Текст сообщения:</label>
        <Textarea
          v-model="valueTextarea"
          placeholder="..."
          rows="5"
          cols="30"
        />
      </div>
      <div v-if="selectedValueMenu == 'changeField'">
        <Dropdown
          v-model="selectedOnOff"
          :options="optionsOffOn"
          optionLabel="name"
          placeholder="off/on"
          class="entityActionInner w-full md:w-14rem"
        />
      </div>
      <div class="upload" v-if="selectedValueMenu == 'message'">
        <FileUploader />

        <div>
          <TextEditor />
        </div>
      </div>
      <div class="selectTag" v-if="selectedValueMenu == 'changeTags'">
        <div class="card flex flex-wrap justify-content-center gap-3">
          <IconField class="search" iconPosition="left">
            <InputIcon class="pi pi-search"> </InputIcon>
            <InputText v-model="searchValue" placeholder="Поиск" />
          </IconField>
        </div>
        <div class="wrapperTag card flex justify-content-center">
          <SelectButton
            v-model="valueTag"
            :options="optionsTag"
            optionLabel="name"
            multiple
            aria-labelledby="multiple"
          />
        </div>
      </div>
      <div class="choosingEntity" v-if="selectedValueMenu == 'transfer'">
        <label for="">Выбор сущности</label>
        <Dropdown
          v-model="choosingEntity"
          :options="entity2"
          optionLabel="name"
          placeholder="Дни"
          class="w-full md:w-14rem"
        />
      </div>
      <div class="aboutTask" v-if="selectedValueMenu == 'addTask'">
        <label for="">Дата выполнения задачи:</label>
        <Dropdown
          v-model="selectedDateCompletionTask"
          :options="dateCompletionTask"
          optionLabel="name"
          placeholder="Дата выполнения задачи"
          class="w-full md:w-14rem"
        />
        <label for="">Название задачи:</label>
        <Dropdown
          v-model="selectedNameTask"
          :options="nameTask"
          optionLabel="name"
          placeholder="Название задачи"
          class="w-full md:w-14rem"
        />
      </div>
    </div>
    <template #footer>
      <Button
        class="w-full flex justify-center bg-red-600"
        :label="$t('palyersViwe.addAction')"
        icon="pi pi-save"
        text
        @click="addCondition"
      />
    </template>
  </Dialog>
</template>
<style lang="scss">
.selectTag {
  .search {
    position: relative;
    width: 100%;
    margin-bottom: 15px;

    span {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
    }

    input {
      padding-left: 38px;
      width: 100%;
      height: 45px;
    }
  }

  .wrapperTag {
    padding: 10px;
    border: 1px solid #d7d8dc;
    border-radius: 5px;

    > div {
      > div {
        margin: 5px;
        border-radius: 5px;
        padding: 5px 2px;
        padding: 15px 5px;
      }
    }
  }
}
</style>
<style lang="scss" scoped>
textarea {
  resize: none;
  margin-top: 5px;
  color: #acadb5;
}

.entityActionInner,
.conditionActionInner {
  margin-top: 5px;
  display: flex;
  height: 45px;
  flex-direction: row;
  align-items: center;
}

.headerAction {
  font-size: 16px;
  color: #74757b;

  .choosingEntity {
    > div {
      margin-top: 5px;
      height: 45px;
      display: flex;
      align-items: center;
    }
  }

  .aboutTask {
    > div {
      margin-top: 5px;
      height: 45px;
      display: flex;
      align-items: center;
    }

    label {
      margin-top: 15px;
    }
  }

  .time {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 20px;

    > div {
      width: 100%;

      > div {
        margin-top: 5px;
        height: 45px;
        display: flex;
        align-items: center;
      }
    }
  }

  .uploadField {
  }

  label {
    font-size: 14px;
  }

  > div {
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
  }

  .nameAction {
    .nameActionInner {
      padding: 12px 50px;
      color: #acadb5;
      border: 1px solid #d7d8dc;
      border-radius: 5px;
      margin-top: 5px;
      background: url(@/assets/icons/players/T.svg) no-repeat center left 18px;
    }
  }
}

.players {
  padding: 10px;
  height: 100%;
  position: relative;

  .nameRobot {
    max-width: 400px;
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 9;
  }

  .menu {
    width: 310px;
    padding: 15px 20px;
    border-radius: 5px;
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 9;
    border: 1px solid #d7d8dc;

    label {
      font-weight: 500;
    }

    ul {
      margin: 10px 0;

      &#actions {
        @for $i from 1 through 7 {
          li:nth-child(#{$i}) {
            background: url(@/assets/icons/players/Actions/#{$i}.svg)
              no-repeat
              left
              13px
              center;
            background-size: 15px;

            &.openMenu {
              background: url(@/assets/icons/players/Actions/#{$i}_#{$i}.svg)
                no-repeat
                left
                13px
                center
                rgb(22 163 74);
              color: #fff;
            }
          }
        }
      }

      &#constructions {
        @for $i from 1 through 7 {
          li:nth-child(#{$i}) {
            background: url(@/assets/icons/players/Constructions/#{$i}.svg)
              no-repeat
              left
              13px
              center;
            background-size: 15px;

            &.openMenu {
              background: url(@/assets/icons/players/Constructions/#{$i}_#{$i}.svg)
                no-repeat
                left
                13px
                center
                rgb(22 163 74);
              color: #fff;
            }
          }
        }
      }

      li {
        padding: 12px;
        border: 1px solid #d7d8dc;
        border-radius: 5px;
        margin-bottom: 5px;
        padding-left: 60px;

        &:hover {
          cursor: pointer;
        }
      }
    }
  }
}
</style>
