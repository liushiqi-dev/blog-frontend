<template>
  <div>
    <AppHeader />

    <main class="main-content">
      <h1 class="page-title">分类管理</h1>

      <!-- 新建分类（仅管理员可见） -->
      <section v-if="isAdmin" class="create-section">
        <h2 class="section-title">新建分类</h2>
        <el-form @submit.prevent="handleCreate">
          <div class="create-form">
            <el-input
              v-model="createForm.name"
              placeholder="例如：Spring Boot"
              size="large"
              :maxlength="20"
              clearable
              @keyup.enter="handleCreate"
            />
            <el-button
              type="primary"
              size="large"
              :icon="Plus"
              :loading="createLoading"
              @click="handleCreate"
            >
              新建
            </el-button>
          </div>
        </el-form>
      </section>

      <!-- 分类列表 -->
      <section class="list-section" v-loading="loading">
        <el-table
          :data="categoryList"
          style="width: 100%"
          :header-cell-style="{ backgroundColor: 'var(--app-muted)', color: 'var(--app-muted-foreground)' }"
        >
          <el-table-column prop="name" label="分类名称" min-width="200">
            <template #default="{ row }">
              <span class="category-name">{{ row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="total" label="文章数" width="120">
            <template #default="{ row }">
              <span class="category-total">{{ row.total }}</span>
            </template>
          </el-table-column>

          <!-- 操作列（编辑/删除）仅管理员可见 -->
          <el-table-column v-if="isAdmin" label="操作" width="200" align="right">
            <template #default="{ row }">
              <el-button
                :icon="EditPen"
                text
                type="primary"
                @click="openEditDialog(row)"
              >
                编辑
              </el-button>
              <el-button
                :icon="Delete"
                text
                type="danger"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>

          <template #empty>
            <el-empty description="暂无分类" />
          </template>
        </el-table>
      </section>
    </main>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑分类"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form @submit.prevent="handleEdit">
        <el-form-item label="分类名称">
          <el-input
            v-model="editForm.name"
            placeholder="请输入分类名称"
            :maxlength="20"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="handleEdit">
          保存
        </el-button>
      </template>
    </el-dialog>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, EditPen, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getCategoryListApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi
} from '@/api/category'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { isAdmin } from '@/stores/user'

const loading = ref(false)
const categoryList = ref([])

// 新建分类
const createForm = reactive({ name: '' })
const createLoading = ref(false)

// 编辑分类
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editForm = reactive({ id: null, name: '' })

// 获取分类列表
async function fetchCategoryList() {
  loading.value = true
  try {
    const res = await getCategoryListApi()
    categoryList.value = res.data
  } catch (error) {
    console.error('获取分类列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 新建分类
async function handleCreate() {
  const name = createForm.name.trim()
  if (name.length < 2 || name.length > 20) {
    ElMessage.warning('分类名称为2-20个字符')
    return
  }

  createLoading.value = true
  try {
    await createCategoryApi({ name })
    ElMessage.success('创建成功')
    createForm.name = ''
    fetchCategoryList()
  } catch (error) {
    // 错误已在响应拦截器中提示
  } finally {
    createLoading.value = false
  }
}

// 打开编辑弹窗
function openEditDialog(row) {
  editForm.id = row.id
  editForm.name = row.name
  editDialogVisible.value = true
}

// 编辑分类
async function handleEdit() {
  const name = editForm.name.trim()
  if (name.length < 2 || name.length > 20) {
    ElMessage.warning('分类名称为2-20个字符')
    return
  }

  editLoading.value = true
  try {
    await updateCategoryApi(editForm.id, { name })
    ElMessage.success('更新成功')
    editDialogVisible.value = false
    fetchCategoryList()
  } catch (error) {
    // 错误已在响应拦截器中提示
  } finally {
    editLoading.value = false
  }
}

// 删除分类
async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类「${row.name}」吗？`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteCategoryApi(row.id)
    ElMessage.success('删除成功')
    fetchCategoryList()
  } catch (error) {
    // 用户点击取消或请求失败（失败已在拦截器中提示）
  }
}

onMounted(() => {
  fetchCategoryList()
})
</script>

<style scoped>
.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 64px 24px;
}

.page-title {
  font-size: 44px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--app-foreground);
  margin: 0 0 40px 0;
}

.create-section {
  background-color: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-lg);
  padding: 24px;
  box-shadow: var(--app-shadow-sm);
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--app-foreground);
  margin: 0 0 16px 0;
}

.create-form {
  display: flex;
  gap: 12px;
}

.list-section {
  background-color: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-lg);
  overflow: hidden;
  box-shadow: var(--app-shadow-sm);
}

.category-name {
  font-weight: 500;
  color: var(--app-foreground);
}

.category-total {
  color: var(--app-muted-foreground);
}
</style>
