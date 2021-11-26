<template>
  <div class="menu">
    <el-dialog
      :title="upadteMenuData ? '编辑菜单':'新增菜单'"
      :visible.sync="dialogVisible"
      width="60%"
      center
      :before-close="handleClose"
      :append-to-body="true"
    >
      <el-form
        ref="menuForm"
        :model="menuForm"
        :label-position="labelPosition"
        label-width="80px"
        status-icon
        :validate-on-rule-change="false"
        :rules="rules"
      >
        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="menuForm.name" placeholder="请输入菜单" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="URL" prop="url">
              <el-input v-model="menuForm.url" placeholder="请输入菜单url" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item label="父菜单" prop="pid">
              <el-select
                v-model="menuForm.pid"
                placeholder="请选择"
                style="width:100%"
                clearable
              >
                <el-option
                  v-for="item in pidList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input v-model="menuForm.sort" placeholder="请输入排序顺序" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="dialog">
        <el-button @click="handleClose">取 消</el-button>
        <el-button @click="handleAddRole">确 定</el-button>
      </div>
    </el-dialog>
    <div @click="openDialog">
      <slot />
    </div>
  </div>
</template>

<script>
import { getMenuList, addMenu, updateMenu } from '../../../api/authority'
const fields = {
  name: '菜单名称',
  url: 'URL',
  pid: '父菜单',
  sort: '排序'
}
export default {
  name: 'MenuAdd',
  // eslint-disable-next-line vue/require-prop-types
  props: ['addMenuData', 'upadteMenuData'],
  data() {
    const validateRequire = (rule, value, callback) => {
      if (!value) {
        callback(new Error(fields[rule.field] + '必须填写'))
      } else {
        callback()
      }
    }
    return {
      menuForm: {
        sort: '1',
        pid: '顶级菜单',
        name: '',
        url: ''
      },
      dialogVisible: false,
      addPid: '',
      labelPosition: 'left',
      pidList: [],
      selectValue: '',
      sort: '',
      rules: {
        name: [{ required: true, validator: validateRequire }],
        url: [{ required: true, validator: validateRequire }],
        pid: [
          { required: true, message: '父菜单选项不能为空', trigger: ['blur'] }
        ],
        sort: [{ required: true, validator: validateRequire }]
      }
    }
  },
  methods: {
    openDialog() {
      this.init()
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
      this.$refs.menuForm.resetFields()
    },
    handleAddRole() {
      this.submitForm('menuForm')
    },
    // 新增/添加菜单事件
    async addOrUddateMenu() {
      const { sort, pid, name, url, id } = this.menuForm
      let newParentId
      if (this.addMenuData) {
        newParentId = this.addPid
      } else {
        if (pid === '顶级菜单') {
          newParentId = 0
        } else {
          newParentId = pid
        }
      }
      const newQuert = {
        pid: newParentId,
        name: name,
        url: url,
        sort: sort
      }
      if (this.upadteMenuData) {
        newQuert.id = id
        await updateMenu(newQuert).then((res) => {
          this.$notify({
            title: '成功',
            message: res.msg || '更新菜单成功',
            type: 'success',
            duration: 2000
          })
        })
      } else {
        await addMenu(newQuert).then((res) => {
          this.$notify({
            title: '成功',
            message: res.msg || '添加菜单成功',
            type: 'success',
            duration: 2000
          })
        })
      }
      this.$refs.menuForm.resetFields()
      this.$emit('updataList')
      // await this.$router.go()
      this.dialogVisible = false
    },
    getList() {
      getMenuList(this.listQuery).then(res => {
        this.pidList = res.data
        this.pidList.unshift({ id: 0, name: '顶级菜单', pid: 0 })
      })
    },
    // 编辑时的数据赋值
    init() {
      this.getList()
      if (this.upadteMenuData) {
        let newMenuData = JSON.parse(JSON.stringify(this.upadteMenuData))
        if (newMenuData === 0) {
          newMenuData = '顶级菜单'
        }
        this.menuForm = newMenuData
        this.menuForm.id = newMenuData.id
      }
      if (this.addMenuData) {
        let newMenuData = JSON.parse(JSON.stringify(this.addMenuData))
        if (newMenuData === 0) {
          newMenuData = '顶级菜单'
        }
        this.menuForm.pid = newMenuData.name
        this.addPid = newMenuData.id
      }
    },
    submitForm(formName) {
      const newRule = [
        ...this.rules.pid,
        { required: true, trigger: 'change' }
      ]
      this.rules = Object.assign({}, this.rules, { pid: newRule })
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.addOrUddateMenu()
        } else {
          return false
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.dialog {
  text-align: center;
  margin-top: 30px;
}
</style>
