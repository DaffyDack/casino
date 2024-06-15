<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const fileInput = ref()
const dropArea = ref()
const submitButton = ref({ disabled: true })
const statusMessage = ref("Nothing's uploaded")
const fileListMetadata = ref([])
const fileNum = ref(0)
const progressBar = ref()
const fileList = ref<any[]>([])
let dragEventCounter = 0

onMounted(() => {
  initDropAreaHighlightOnDrag()
})

function handleSubmit() {
  console.log('действие')
  showPendingState()
  uploadFiles(fileInput.value.files)
}

function handleDrop(event: any) {
  event.preventDefault()
  resetFormState()
  try {
    assertFilesValid(event.dataTransfer.files)
  } catch (err: any) {
    updateStatusMessage(err.message)
    return
  }
  showPendingState()
  uploadFiles(event.dataTransfer.files)
  fileList.value = Array.from(event.dataTransfer.files)
  dragEventCounter = 0
  dropArea.value.classList.remove('highlight')
}

function handleInputChange() {
  resetFormState()
  try {
    assertFilesValid(fileInput.value.files)
  } catch (err: any) {
    updateStatusMessage(err.message)
    return
  }
  submitButton.value.disabled = false
  fileList.value = Array.from(fileInput.value.files)
}

function handleDragEnter(event: any) {
  event.preventDefault()
  if (dragEventCounter === 0) {
    dropArea.value.classList.add('highlight')
  }
  dragEventCounter += 1
}

function handleDragOver(event: any) {
  event.preventDefault()
  if (dragEventCounter === 0) {
    dragEventCounter = 1
  }
}

function handleDragLeave(event: any) {
  event.preventDefault()
  dragEventCounter -= 1
  if (dragEventCounter <= 0) {
    dragEventCounter = 0
    dropArea.value.classList.remove('highlight')
  }
}

function uploadFiles(files: any) {
  console.log('пашла жара')
  const url = 'https://httpbin.org/post' // куда грузим?
  const method = 'post'
  const xhr = new XMLHttpRequest()

  xhr.upload.addEventListener('progress', (event) => {
    updateStatusMessage(`Загрузка ${event.loaded} bytes of ${event.total}`)
    // updateProgressBar(event.loaded / event.total);
  })

  xhr.addEventListener('loadend', () => {
    if (xhr.status === 200) {
      updateStatusMessage('✅ Success')
      renderFilesMetadata(files)
    } else {
      updateStatusMessage('Error')
    }
    // updateProgressBar(0);
  })

  const data = new FormData()
  for (const file of files) {
    data.append('file', file)
  }

  xhr.open(method, url)
  xhr.send(data)
}

function renderFilesMetadata(files: any) {
  fileNum.value = files.length
  fileListMetadata.value = Array.from(files)
}

function assertFilesValid(files: any) {
  const allowedTypes = ['image/webp', 'image/jpeg', 'image/png']
  const sizeLimit = 1024 * 1024 // 1 megabyte

  for (const file of files) {
    const { name: fileName, size: fileSize } = file

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `File "${fileName}" не удалось загрузить. Разрешены только изображения следующих типов: WEBP, JPEG, PNG.`,
      )
    }

    if (fileSize > sizeLimit) {
      throw new Error(
        `File "${fileName}" не удалось загрузить. Разрешены только изображения размером до 1 МБ.`,
      )
    }
  }
}

function updateStatusMessage(text: any) {
  statusMessage.value = text
}

// function updateProgressBar(value: any) {
//   const percent = value * 100;
//   progressBar.value.value = Math.round(percent);
// }

function showPendingState() {
  submitButton.value.disabled = true
  updateStatusMessage('Pending...')
}

function resetFormState() {
  fileListMetadata.value = []
  fileNum.value = 0
  submitButton.value.disabled = true
  updateStatusMessage(` Nothing's uploaded`)
}

const initDropAreaHighlightOnDrag = () => {
  dropArea.value.addEventListener('dragenter', handleDragEnter)
  dropArea.value.addEventListener('dragover', handleDragOver)
  dropArea.value.addEventListener('dragleave', handleDragLeave)
  dropArea.value.addEventListener('drop', handleDrop)
}
</script>
<template>
  <div>
    <div class="fileUploader">
      <form @submit.prevent="handleSubmit">
        <div
          id="dropArea"
          ref="dropArea"
          @dragenter="handleDragEnter"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
        >
          <label class="input-file">
            <input
              type="file"
              name="file"
              class="SelectFile"
              ref="fileInput"
              @change="handleInputChange"
              multiple
              accept="image/webp, image/jpeg, image/png"
            />
            <span class="input-file-text">Перетяните или </span>
            <span class="input-file-btn"
              >выберите файл на вашем устройстве</span
            >
          </label>
        </div>
        <!-- <button type="submit" :disabled="submitButton.disabled">
          Upload
        </button> -->
      </form>
      <!-- <div id="statusMessage">{{ statusMessage }}</div> -->
      <div id="fileListMetadata">
        <ul>
          <li v-for="file in fileList" class="fileStyle" :key="file.name">
            <div>{{ file.name }}</div>
            <div>{{ file.size }}</div>
          </li>
        </ul>
      </div>
      <!-- <div id="fileNum">{{ fileList.length }}</div>
      <progress ref="progressBar" value="0" max="100"></progress> -->
    </div>
  </div>
</template>

<style scoped lang="scss">
.fileUploader {
  .fileStyle {
    display: flex;
    flex-direction: column;
    padding-left: 50px;
  }

  .input-file {
    position: relative;
    display: flex;
    font-size: 14px;
  }

  .input-file-btn {
    position: relative;
    display: inline-block;
    cursor: pointer;
    outline: none;
    text-decoration: none;
    font-size: 14px;
    vertical-align: middle;
    color: #488aff;
    text-align: center;
    border-radius: 4px;
    box-sizing: border-box;
    border: none;
    margin: 0;
    transition: background-color 0.2s;
    text-decoration: underline;
  }

  .input-file-text {
    padding: 0 10px;
    display: inline-block;
    color: #488aff;
  }

  .input-file input[type='file'] {
    position: absolute;
    z-index: -1;
    opacity: 0;
    display: block;
    width: 0;
    height: 0;
  }

  /* Focus */
  .input-file input[type='file']:focus + .input-file-btn {
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  /* Disabled */
  .input-file input[type='file']:disabled + .input-file-btn {
    background-color: #eee;
  }

  ul li {
    text-align: left;
    display: flex;
    justify-content: space-between;
    position: relative;
    line-height: 1.4em;
    margin: 15px 0;
    position: relative;

    &:hover {
      cursor: pointer;
      background: #8886862b;
      border-radius: 5px;

      &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        height: 41px;
        width: 41px;
        background: url(@/assets/icons/players/delete.svg) no-repeat center;
        border-radius: 5px;
      }
    }

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 41px;
      width: 41px;
      background: url(@/assets/icons/players/fileicon.svg) no-repeat center
        #3575e6;
      border-radius: 5px;
    }
  }

  ul li p {
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  progress {
    width: 300px;
    margin: 20px 0 0;
  }

  #dropArea.highlight {
    border-color: #007aff;
  }

  #dropArea {
    margin: 0 auto;

    border: 2px dashed #007aff;
    background: url(@/assets/icons/players/cloudUp.svg) no-repeat center left
      18px;
    border-radius: 5px;
    width: 100%;
    padding: 20px 20px 20px 40px;
  }

  input[type='file']::file-selector-button {
    margin: 0 20px 10px 0;
  }

  input[type='file'] {
    color: #999;
    width: 250px;
  }

  button,
  input[type='file'] {
    display: block;
    margin: 20px auto;
    font-size: 16px;
  }

  .bold {
    font-weight: bold;
    text-transform: uppercase;
  }

  button:disabled,
  button:disabled:hover {
    background: #ddd;
    border-color: #777;
    color: #313131;
    cursor: auto;
  }

  button,
  input[type='file']::file-selector-button {
    padding: 8px 16px;
    background: #000;
    cursor: pointer;
    border-radius: 5px;
    border: 1px solid #000;
    color: #fff;
  }

  button:hover,
  input[type='file']::file-selector-button:hover {
    background: #313131;
    transition: all 0.2s ease;
  }
}
</style>
