<template>
  <div class="role">
    <el-dialog
      :title="updateRole ? '编辑角色' : '新增角色'"
      :visible.sync="dialogVisible"
      width="60%"
      center
      :before-close="handleClose"
      :append-to-body="true"
    >
      <div class="role">
        <el-form
          ref="roleForm"
          :model="roleForm"
          :label-position="labelPosition"
          label-width="80px"
          status-icon
          :validate-on-rule-change="false"
          :rules="rules"
        >
          <el-row>
            <el-col :span="24">
              <el-form-item label="名称" prop="name">
                <el-input v-model="roleForm.name" placeholder="请输入名称" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-col :span="24">
            <el-form-item label="菜单" prop="menu">
              <el-tree
                ref="tree"
                :data="menuList"
                show-checkbox
                node-key="id"
                default-expand-all
                :props="defaultProps"
                :default-checked-keys="defaultChecked"
                @check="handleCheck"
              />
            </el-form-item>
          </el-col>
        </el-form>
        <div class="dialog">
          <el-button @click="handleClose">取 消</el-button>
          <el-button @click="handleAddRole">确 定</el-button>
        </div>
      </div>
    </el-dialog>
    <div @click="openDialog">
      <slot />
    </div>
  </div>
</template>
<script>
import {
  getMenuList,
  getMenuRole,
  addRole,
  updataRole
} from '../../../api/authority'
import { formatTree } from '../../../utils/role'

const fields = {
  name: '角色名称',
  menu: '菜单'
}
export default {
  name: 'RoleFormDialog',
  // eslint-disable-next-line vue/require-prop-types
  props: ['updateRole'],
  data() {
    const validateRequire = (rule, value, callback) => {
      if (!value) {
        callback(new Error(fields[rule.field] + '必须填写'))
      } else {
        callback()
      }
    }
    return {
      labelPosition: 'left',
      roleId: '', // 记录角色id
      roleForm: {
        menu: [],
        name: ''
      },
      dialogVisible: false,
      defaultChecked: [],
      menuList: [],
      rules: {
        name: [{ required: true, validator: validateRequire }],
        menu: [{
          required: true,
          message: '菜单不能为空',
          trigger: ['change', 'focus']
        }]
      },
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  methods: {
    openDialog() {
      this.init()
      this.getList()
      this.dialogVisible = true
    },
    // 取消弹框
    handleClose() {
      this.$refs.roleForm.resetFields()
      if (!this.updateRole) {
        this.$refs.tree.setCheckedKeys([])
      }
      this.dialogVisible = false
    },
    // 弹框确定事件
    handleAddRole() {
      this.submitForm('roleForm')
    },
    // 添加/编辑事件
    async addOrUpdate() {
      const roleName = this.roleForm.name
      const oldData = this.newmenuList(this.$refs.tree.getCheckedNodes())
      const newMenu = []
      oldData.map(item => {
        newMenu.push(item.id)
      })
      const RoleId = this.roleId
      const roleData = {
        name: roleName,
        menu: newMenu.join(',')
      }
      if (!this.updateRole) {
        await addRole(roleData).then(result => {
          this.$notify({
            title: '成功',
            message: result.msg || '添加角色成功',
            type: 'success',
            duration: 2000
          })
        })
      } else {
        roleData.id = RoleId
        await updataRole(roleData).then(result => {
          this.$notify({
            title: '成功',
            message: result.msg || '编辑角色成功',
            type: 'success',
            duration: 2000
          })
        })
      }
      // await this.$router.go()
      this.dialogVisible = false
      this.$refs.roleForm.resetFields()
      this.$emit('updataList')
    },
    newmenuList(data) {
      return data.filter(item => item.id)
    },
    getList() {
      getMenuList().then(res => {
        this.menuList = formatTree(res.data)
      })
    },
    init() {
      if (this.updateRole) {
        const newData = []
        getMenuRole(this.updateRole).then(res => {
          res.data.map(item => {
            newData.push(item.menu_id)
          })
          this.roleForm.name = this.updateRole.name
          this.roleForm.menu = newData
          this.defaultChecked = newData
          this.roleId = this.updateRole.id
        })
      } else {
        if (this.$refs.roleForm) {
          this.$refs.roleForm.resetFields()
        }
      }
    },
    handleCheck() {
      this.roleForm.menu = this.$refs.tree.getCheckedNodes()
      this.$refs.roleForm.validateField('menu')
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.addOrUpdate()
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
