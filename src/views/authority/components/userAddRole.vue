<template>
  <div class="addUser">
    <el-dialog
      :title="userData ? '编辑用户' : '新增用户'"
      :visible.sync="dialogVisible"
      width="60%"
      center
      :before-close="handleClose"
      :append-to-body="true"
    >
      <el-form
        ref="form"
        :model="form"
        :label-position="labelPosition"
        label-width="80px"
        status-icon
        :rules="rules"
        :validate-on-rule-change="false"
      >
        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户密码" prop="password">
              <el-input
                v-model="form.password"
                :disabled="!!userData"
                show-password
                type="password"
                placeholder="请输入用户密码"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="form.nickname" placeholder="请输入昵称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户邮箱" prop="email">
              <el-input
                v-model="form.email"
                type="email"
                placeholder="请输入用户邮箱"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item label="用户头像">
              <span v-if="!form.avatar && userData">暂无用户头像</span>
              <el-upload
                ref="upload"
                :class="{disabled:form.avatar}"
                :action="action"
                list-type="picture-card"
                :on-preview="handlePictureCardPreview"
                :on-remove="handleRemove"
                :limit="1"
                :file-list="fileList"
                accept="jpg/png/gif"
                :before-upload="beforeUpload"
                :on-exceed="onExceed"
                :on-success="succuss"
              >
                <i class="el-icon-plus" />
              </el-upload>
              <img :visible.sync="dialogVisible">
              <img
                v-show="dialogImageUrl"
                width="100%"
                :src="dialogImageUrl"
                alt=""
              >
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="role" label="角色">
              <el-select
                v-model="form.role"
                multiple
                style="width:100%"
                placeholder="请选择角色"
                :poper-append-to-body="false"
                clearable
              >
                <el-option
                  v-for="item in roleList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
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
const fields = {
  username: '用户名',
  password: '密码',
  nickname: '用户昵称'
}
import { getRoleList, updateUser, addUserList } from '../../../api/authority'
export default {
  name: 'UserRoleAdd',
  // eslint-disable-next-line vue/require-prop-types
  props: ['userData'],
  data() {
    const validateRequire = (rule, value, callback) => {
      if (!value) {
        callback(new Error(fields[rule.field] + '必须填写'))
      } else {
        callback()
      }
    }
    return {
      action: `https://fast-learn.youbaobao.xyz:8000/role/addUserAvatar`,
      dialogImageUrl: '',
      dialogVisible: false,
      fileList: [], // 存放文件位置
      oldAvatar: false, // 上传时展示的图片
      labelPosition: 'left',
      roleList: [],
      form: {},
      rules: {
        username: [{ required: true, validator: validateRequire }],
        password: [{ required: true, validator: validateRequire }],
        nickname: [{ required: true, validator: validateRequire }],
        emial: [{ required: false }],
        role: [
          {
            required: true,
            message: '用户角色不能为空',
            trigger: ['blur']
          }
        ]
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
      this.dialogVisible = false
      this.$refs.form.resetFields()
      if (this.$refs['upload']) {
        // 清空上传的图片
        this.$refs['upload'].clearFiles()
      }
    },
    // 弹框确定事件
    handleAddRole() {
      this.submitForm('form')
    },
    // 清除高亮显示带来的副作用 （如果是高亮情况下弹框的内容是html元素）
    highlightConversion(data) {
      const { email, nickname, username } = data
      this.form.email = email ? this.htmlChangeText(email) : ''
      this.form.nickname = nickname ? this.htmlChangeText(nickname) : ''
      this.form.username = username ? this.htmlChangeText(username) : ''
    },
    htmlChangeText(string) {
      if (string.indexOf('</span>') === -1) {
        return string
      } else {
        const newStr = string
          .replace(new RegExp('<span style="color: #1890ff"', 'ig'), '')
          .replace(new RegExp('</span>', 'ig'), '')
          .replace(new RegExp('>', 'ig'), '')
          .replace(new RegExp(' ', 'g'), '')
        return newStr
      }
    },

    async addOrUpdateUser() {
      let oldRole = ''
      this.form.role.map(item => {
        oldRole += `,${item}`
      })
      const newRole = oldRole.replace(',', '')
      const newUserRole = {
        username: this.form.username,
        nickname: this.form.nickname,
        email: this.form.email,
        role: newRole,
        password: this.form.password,
        avatar: this.form.avatar
      }
      if (this.userData) {
        newUserRole.id = this.form.id
        await updateUser(newUserRole).then(res => {
          this.$notify({
            title: '成功',
            message: res.msg || '更新用户成功',
            type: 'success',
            duration: 2000
          })
        })
      } else {
        await addUserList(newUserRole).then(res => {
          this.$notify({
            title: '成功',
            message: res.msg || '添加用户成功',
            type: 'success',
            duration: 2000
          })
        })
      }
      this.$refs.form.resetFields()
      if (this.$refs['upload']) {
        // 清空上传的图片
        this.$refs['upload'].clearFiles()
      }
      this.dialogVisible = false
      this.$emit('updateList')
    },
    // 获取用户角色接口
    getList() {
      getRoleList().then(result => {
        this.roleList = result.data
      })
    },
    // 初始化数据
    init() {
      if (this.userData) {
        const oldData = JSON.parse(JSON.stringify(this.userData))
        if (typeof oldData.role !== 'object') {
          if (typeof oldData.role === 'string') {
            if (oldData.role.indexOf(',') !== -1) {
              oldData.role = oldData.role.split(',')
            } else {
              oldData.role = [oldData.role]
            }
          }
        }
        this.form = oldData
        this.highlightConversion(oldData)
        if (this.$refs['upload']) {
          // 清空上传的图片
          this.$refs['upload'].clearFiles()
        }

        if (this.form.avatar) {
          this.fileList = []
          const newUlr = { url: oldData.avatar }
          this.fileList = [newUlr]
        }
      }
    },
    handleRemove(file, fileList) {
      this.dialogImageUrl = ''
      this.form.avatar = ''
    },
    submitForm(formName) {
      const newRule = [
        ...this.rules.role,
        { required: true, trigger: 'change' }
      ]
      this.rules = Object.assign({}, this.rules, { role: newRule })
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.addOrUpdateUser()
        } else {
          return false
        }
      })
    },
    // 上传之前
    beforeUpload(file) {
      const uploadType = file.name.substring(file.name.lastIndexOf('.') + 1)
      const imgType = uploadType === 'jpg'
      const imgType2 = uploadType === 'jpeg'
      const imgType3 = uploadType === 'gif'
      if (!imgType && !imgType2 && !imgType3) {
        this.$message({
          message: '头像只能是jpg,jpeg,gie格式',
          type: 'warning'
        })
      }
      this.oldAvatar = false
      return imgType || imgType2 || imgType3
    },
    succuss(file) {
      this.form.avatar = file.data.url
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    onExceed() {
      this.$message({
        message: '每次只能上传一张图片',
        type: 'warning'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.oldimg {
  width: 146px;
  height: 146px;
}
.dialog {
  text-align: center;
  margin-top: 30px;
}
.disabled {
  width: 150px;
  height: 150px;
  overflow: hidden;
}

</style>
