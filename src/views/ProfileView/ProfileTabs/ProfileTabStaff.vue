<script setup>
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import ConfirmPopup from 'primevue/confirmpopup'
import Toast from 'primevue/toast'
import RadioButton from 'primevue/radiobutton'
import Textarea from 'primevue/textarea'
import Tag from 'primevue/tag'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import TreeSelect from 'primevue/treeselect'
const confirm = useConfirm()
const toast = useToast()

const showTemplate = (event) => {
  confirm.require({
    target: event.currentTarget,
    group: 'templating',
    acceptIcon: 'pi pi-check mr-2',
    rejectIcon: 'pi pi-times mr-2',
    rejectClass: '!text-sm !py-2 !px-3',
    acceptClass:
      '!bg-transparent !text-primary-500 hover:!bg-primary-300/20 !text-sm !py-2 !px-3',
    reject: () => {
      toast.add({
        severity: 'error',
        summary: 'Rejected',
        detail: 'You have rejected',
        life: 3000,
      })
    },
  })
}
const getProductsData = () => {
  return [
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'bamboo-watch.jpg',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'INSTOCK',
      rating: 5,
    },
    {
      id: '1001',
      code: 'nvklal433',
      name: 'Black Watch',
      description: 'Product Description',
      image: 'black-watch.jpg',
      price: 72,
      category: 'Accessories',
      quantity: 61,
      inventoryStatus: 'INSTOCK',
      rating: 4,
    },
    {
      id: '1002',
      code: 'zz21cz3c1',
      name: 'Blue Band',
      description: 'Product Description',
      image: 'blue-band.jpg',
      price: 79,
      category: 'Fitness',
      quantity: 2,
      inventoryStatus: 'LOWSTOCK',
      rating: 3,
    },
    {
      id: '1003',
      code: '244wgerg2',
      name: 'Blue T-Shirt',
      description: 'Product Description',
      image: 'blue-t-shirt.jpg',
      price: 29,
      category: 'Clothing',
      quantity: 25,
      inventoryStatus: 'INSTOCK',
      rating: 5,
    },
    {
      id: '1004',
      code: 'h456wer53',
      name: 'Bracelet',
      description: 'Product Description',
      image: 'bracelet.jpg',
      price: 15,
      category: 'Accessories',
      quantity: 73,
      inventoryStatus: 'INSTOCK',
      rating: 4,
    },
    {
      id: '1005',
      code: 'av2231fwg',
      name: 'Brown Purse',
      description: 'Product Description',
      image: 'brown-purse.jpg',
      price: 120,
      category: 'Accessories',
      quantity: 0,
      inventoryStatus: 'OUTOFSTOCK',
      rating: 4,
    },
    {
      id: '1006',
      code: 'bib36pfvm',
      name: 'Chakra Bracelet',
      description: 'Product Description',
      image: 'chakra-bracelet.jpg',
      price: 32,
      category: 'Accessories',
      quantity: 5,
      inventoryStatus: 'LOWSTOCK',
      rating: 3,
    },
    {
      id: '1028',
      code: 'tx125ck42',
      name: 'Yoga Mat',
      description: 'Product Description',
      image: 'yoga-mat.jpg',
      price: 20,
      category: 'Fitness',
      quantity: 15,
      inventoryStatus: 'INSTOCK',
      rating: 5,
    },
    {
      id: '1029',
      code: 'gwuby345v',
      name: 'Yoga Set',
      description: 'Product Description',
      image: 'yoga-set.jpg',
      price: 20,
      category: 'Fitness',
      quantity: 25,
      inventoryStatus: 'INSTOCK',
      rating: 8,
    },
  ]
}
const getProducts = () => {
  return Promise.resolve(getProductsData())
}

onMounted(() => {
  getProducts().then((data) => (products.value = data))
})

const dt = ref()
const products = ref()
const productDialog = ref(false)
const deleteProductDialog = ref(false)
const deleteProductsDialog = ref(false)
const product = ref({})
const selectedProducts = ref()
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})
const submitted = ref(false)
const statuses = ref([
  { label: 'INSTOCK', value: 'instock' },
  { label: 'LOWSTOCK', value: 'lowstock' },
  { label: 'OUTOFSTOCK', value: 'outofstock' },
])

const formatCurrency = (value) => {
  if (value)
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  return
}
const hideDialog = () => {
  productDialog.value = false
  submitted.value = false
}
const saveProduct = () => {
  submitted.value = true

  if (product?.value.name?.trim()) {
    if (product.value.id) {
      product.value.inventoryStatus = product.value.inventoryStatus.value
        ? product.value.inventoryStatus.value
        : product.value.inventoryStatus
      products.value[findIndexById(product.value.id)] = product.value
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Product Updated',
        life: 3000,
      })
    } else {
      product.value.id = createId()
      product.value.code = createId()
      product.value.image = 'product-placeholder.svg'
      product.value.inventoryStatus = product.value.inventoryStatus
        ? product.value.inventoryStatus.value
        : 'INSTOCK'
      products.value.push(product.value)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Product Created',
        life: 3000,
      })
    }

    productDialog.value = false
    product.value = {}
  }
}
const editProduct = (prod) => {
  product.value = { ...prod }
  productDialog.value = true
}
const confirmDeleteProduct = (prod) => {
  product.value = prod
  deleteProductDialog.value = true
}
const deleteProduct = () => {
  products.value = products.value.filter((val) => val.id !== product.value.id)
  deleteProductDialog.value = false
  product.value = {}
  toast.add({
    severity: 'success',
    summary: 'Successful',
    detail: 'Product Deleted',
    life: 3000,
  })
}
const findIndexById = (id) => {
  let index = -1
  for (let i = 0; i < products.value.length; i++) {
    if (products.value[i].id === id) {
      index = i
      break
    }
  }

  return index
}
const createId = () => {
  let id = ''
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (var i = 0; i < 5; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return id
}
const deleteSelectedProducts = () => {
  products.value = products.value.filter(
    (val) => !selectedProducts.value.includes(val),
  )
  deleteProductsDialog.value = false
  selectedProducts.value = null
  toast.add({
    severity: 'success',
    summary: 'Successful',
    detail: 'Products Deleted',
    life: 3000,
  })
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'INSTOCK':
      return 'success'

    case 'LOWSTOCK':
      return 'warning'

    case 'OUTOFSTOCK':
      return 'danger'

    default:
      return null
  }
}

const isOpenRole = ref(false)
const selectedOptionRole = ref('')
const optionsRole = ref([
  'Ответственный 1',
  'Ответственный 2',
  'Ответственный 3',
])
const toggleOpenRole = () => {
  isOpenRole.value = !isOpenRole.value
}
const selectOptionRole = (option) => {
  selectedOptionRole.value = option
  isOpenRole.value = !isOpenRole.value
}

const isOpenStatus = ref(false)
const selectedOptionStatus = ref('')
const optionsStatus = ref(['Вариант 1', 'Вариант 2', 'Вариант 3'])
const toggleOpenStatus = () => {
  isOpenStatus.value = !isOpenStatus.value
}
const selectOptionStatus = (option) => {
  selectedOptionStatus.value = option
  isOpenStatus.value = !isOpenStatus.value
}
</script>

<template>
  <div class="border">
    <p class="mt-4 flex flex-col px-4 mb-2 font-bold text-lg">
      {{ $t('profileStaff.basicInformation') }}
    </p>
    <div>
      <div class="px-3 py-2">
        <Toast />
        <ConfirmPopup group="templating" class="" dismissable="false">
          <!-- <template #message="slotProps">
                        <div
                            class="flex flex-col items-center w-full gap-3 border-b border-surface-200 dark:border-surface-700 p-3 mb-6">
                            <i :class="slotProps.message.icon" class="text-6xl text-primary-500"></i>
                            <p>{{ slotProps.message.message }}</p>
                        </div>
                    </template> -->
          <template #container="{ acceptCallback }">
            <div
              class="flex flex-col items-start w-full gap-3 p-3 border-solid border rounded-md border-neutral-200"
            >
              <div>{{ $t('profileStaff.filter') }}</div>
              <div class="formForFilter flex flex-wrap gap-3 p-fluid gap-x-2.5">
                <div class="flex grow flex-col w-full">
                  <label for="search" class="text-gray-16">{{
                    $t('profileStaff.search')
                  }}</label>
                  <InputText
                    class="grow"
                    :placeholder="$t('profileStaff.enter')"
                    id="search"
                  />
                </div>
                <div
                  class="flex flex-row justify-between w-[100%] gap-2 md:flex-col"
                >
                  <div class="flex grow flex-col">
                    <label for="role">{{ $t('profileStaff.role') }}</label>
                    <div id="role" class="select" @click.stop="toggleOpenRole">
                      <input
                        class="select__input"
                        type="hidden"
                        :value="selectedOptionRole"
                        @click.stop="toggleOpenRole"
                      />
                      <div
                        class="select__head"
                        :class="{ open: isOpenRole }"
                        @click.stop="toggleOpenRole"
                      >
                        {{
                          selectedOptionRole || $t('profileStaff.responsible')
                        }}
                      </div>
                      <ul
                        class="select__list"
                        :style="{ display: isOpenRole ? 'block' : 'none' }"
                        @click.stop="selectOptionRole"
                      >
                        <li
                          class="select__item"
                          v-for="(option, index) in optionsRole"
                          :key="index"
                          @click.stop="selectOptionRole(option)"
                        >
                          {{ option }}
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="flex grow flex-col">
                    <label for="status">{{ $t('profileStaff.status') }}</label>
                    <div
                      id="status"
                      class="select"
                      @click.stop="toggleOpenStatus"
                    >
                      <input
                        class="select__input"
                        type="hidden"
                        :value="selectedOptionStatus"
                        @click.stop="toggleOpenStatus"
                      />
                      <div
                        class="select__head"
                        :class="{ open: isOpenStatus }"
                        @click.stop="toggleOpenStatus"
                      >
                        {{ selectedOptionStatus || $t('profileStaff.option') }}
                      </div>
                      <ul
                        class="select__list"
                        :style="{ display: isOpenStatus ? 'block' : 'none' }"
                        @click.stop="selectOptionStatus"
                      >
                        <li
                          class="select__item"
                          v-for="(option, index) in optionsStatus"
                          :key="index"
                          @click.stop="selectOptionStatus(option)"
                        >
                          {{ option }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2 mt-3 w-full">
                <Button
                  class="w-full"
                  :label="$t('profileStaff.search')"
                  @click="acceptCallback"
                  size="small"
                  outlined
                ></Button>
              </div>
            </div>
          </template>
        </ConfirmPopup>
        <div class="flex justify-start">
          <Button
            @click="showTemplate($event)"
            icon="pi pi-filter"
            :label="$t('filter')"
          ></Button>
        </div>
      </div>
      <div class="card">
        <DataTable
          scrollable
          scrollHeight="400px"
          ref="dt"
          :value="products"
          v-model:selection="selectedProducts"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
        >
          <!-- <template #header>
                        <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
                            <h4 class="m-0">Manage Products</h4>
                            <IconField iconPosition="left">
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </IconField>
                        </div>
                    </template> -->

          <Column
            field="id"
            header="ID"
            sortable
            style="min-width: 8rem"
          ></Column>
          <Column field="name" :header="$t('name')" sortable></Column>
          <Column
            field="price"
            header="e-mail"
            sortable
            style="min-width: 8rem"
          >
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.price) }}
            </template>
          </Column>
          <Column
            field="category"
            :header="$t('data')"
            sortable
            style="min-width: 10rem"
          ></Column>
          <Column
            field="category"
            :header="$t('role')"
            sortable
            style="min-width: 10rem"
          ></Column>
          <Column
            field="inventoryStatus"
            :header="$t('status')"
            sortable
            style="min-width: 10rem"
          ></Column>

          <Column
            :exportable="false"
            style="min-width: 10rem"
            :header="$t('actions')"
          >
            <template #body="slotProps">
              <Button
                icon="pi pi-caret-right"
                outlined
                class="mr-2"
                severity="success"
              />
              <Button
                icon="pi pi-pencil"
                outlined
                class="mr-2"
                @click="editProduct(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                outlined
                severity="danger"
                @click="confirmDeleteProduct(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>
      </div>

      <Dialog
        v-model:visible="productDialog"
        :style="{ width: '450px' }"
        header="Product Details"
        :modal="true"
        class="p-fluid"
      >
        <img
          v-if="product.image"
          :src="`https://primefaces.org/cdn/primevue/images/product/${product.image}`"
          :alt="product.image"
          class="block m-auto pb-3"
        />
        <div class="field">
          <label for="name">Name</label>
          <InputText
            id="name"
            v-model.trim="product.name"
            required="true"
            autofocus
            :invalid="submitted && !product.name"
          />
          <small class="p-error" v-if="submitted && !product.name"
            >Name is required.</small
          >
        </div>
        <div class="field">
          <label for="description">Description</label>
          <Textarea
            id="description"
            v-model="product.description"
            required="true"
            rows="3"
            cols="20"
          />
        </div>

        <div class="field">
          <label for="inventoryStatus" class="mb-3">Inventory Status</label>
          <Dropdown
            id="inventoryStatus"
            v-model="product.inventoryStatus"
            :options="statuses"
            optionLabel="label"
            placeholder="Select a Status"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value && slotProps.value.value">
                <Tag
                  :value="slotProps.value.value"
                  :severity="getStatusLabel(slotProps.value.label)"
                />
              </div>
              <div v-else-if="slotProps.value && !slotProps.value.value">
                <Tag
                  :value="slotProps.value"
                  :severity="getStatusLabel(slotProps.value)"
                />
              </div>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
          </Dropdown>
        </div>

        <div class="field">
          <label class="mb-3">Category</label>
          <div class="formgrid grid">
            <div class="field-radiobutton col-6">
              <RadioButton
                id="category1"
                name="category"
                value="Accessories"
                v-model="product.category"
              />
              <label for="category1">Accessories</label>
            </div>
            <div class="field-radiobutton col-6">
              <RadioButton
                id="category2"
                name="category"
                value="Clothing"
                v-model="product.category"
              />
              <label for="category2">Clothing</label>
            </div>
            <div class="field-radiobutton col-6">
              <RadioButton
                id="category3"
                name="category"
                value="Electronics"
                v-model="product.category"
              />
              <label for="category3">Electronics</label>
            </div>
            <div class="field-radiobutton col-6">
              <RadioButton
                id="category4"
                name="category"
                value="Fitness"
                v-model="product.category"
              />
              <label for="category4">Fitness</label>
            </div>
          </div>
        </div>

        <div class="formgrid grid">
          <div class="field col">
            <label for="price">Price</label>
            <InputNumber
              id="price"
              v-model="product.price"
              mode="currency"
              currency="USD"
              locale="en-US"
            />
          </div>
          <div class="field col">
            <label for="quantity">Quantity</label>
            <InputNumber id="quantity" v-model="product.quantity" integeronly />
          </div>
        </div>
        <template #footer>
          <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
          <Button label="Save" icon="pi pi-check" text @click="saveProduct" />
        </template>
      </Dialog>

      <Dialog
        v-model:visible="deleteProductDialog"
        :style="{ width: '450px' }"
        header="Confirm"
        :modal="true"
      >
        <div class="confirmation-content">
          <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
          <span v-if="product"
            >Are you sure you want to delete <b>{{ product.name }}</b
            >?</span
          >
        </div>
        <template #footer>
          <Button
            label="No"
            icon="pi pi-times"
            text
            @click="deleteProductDialog = false"
          />
          <Button label="Yes" icon="pi pi-check" text @click="deleteProduct" />
        </template>
      </Dialog>

      <Dialog
        v-model:visible="deleteProductsDialog"
        :style="{ width: '450px' }"
        header="Confirm"
        :modal="true"
      >
        <div class="confirmation-content">
          <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
          <span v-if="product"
            >Are you sure you want to delete the selected products?</span
          >
        </div>
        <template #footer>
          <Button
            label="No"
            icon="pi pi-times"
            text
            @click="deleteProductsDialog = false"
          />
          <Button
            label="Yes"
            icon="pi pi-check"
            text
            @click="deleteSelectedProducts"
          />
        </template>
      </Dialog>
    </div>
  </div>
</template>

<style scoped lang="scss">
.formForFilter {
  color: #74757b;

  .select {
    position: relative;
    display: block;
    min-width: 220px;
    width: 100%;
    max-width: 400px;
    margin-bottom: 20px;
  }

  .select__head {
    width: 100%;
    border: 1px solid #d7d8dc;
    border-radius: 5px;
    padding: 6px 10px;
    font-size: 14px;
    line-height: 18px;
    color: #74757ba3;
    cursor: pointer;
  }

  .select__head::after {
    width: 10px;
    height: 6px;
    background: #fff url(@/assets/icons/Profile/miniArrow.svg) no-repeat center /
      cover;
    position: absolute;
    right: 20px;
    bottom: 50%;
    transform: translateY(50%);
    content: '';
    display: block;
    transition: 0.2s ease-in;
  }

  .select__head.open::after {
    transform: translateY(50%) rotate(180deg);
  }

  .select__list {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    margin-top: 5px;
    max-height: 205px;
    overflow-x: hidden;
    overflow-y: auto;
    z-index: 100;
    margin: 0;
    padding: 0;
    font-size: 14px;
    color: #424348;
    scrollbar-color: dark;
    scrollbar-width: thin;
    overscroll-behavior: contain;
  }

  .select__list::-webkit-scrollbar {
    width: 7px;
    background-color: #f8f9fa;
    padding: 5px;
  }

  .select__list::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: #d9d9d9;
  }

  .select__list .select__item {
    position: relative;
    border-top: 1px solid rgba(224, 229, 231, 0.5);
    padding: 10px 15px;
    cursor: pointer;
    list-style-type: none;
  }

  .select__list .select__item:hover {
    background-color: rgba(224, 229, 231, 0.5);
  }

  > div {
    &:first-child {
      width: 100%;
    }
  }

  select {
    border: 1px solid #d7d8dc;
    padding: 5px 10px;
    border-radius: 5px;
  }
}
</style>
