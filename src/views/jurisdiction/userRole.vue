<template>
  <div class="userRole">
    <div class="filter-container">
      <el-input
        v-model="listQuery.username"
        placeholder="姓名"
        style="width: 200px"
        class="filter-item"
        prefix-icon="el-icon-search"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
        @blur="handleFilter"
      />
      <el-input
        v-model="listQuery.nickname"
        placeholder="昵称"
        prefix-icon="el-icon-search"
        style="width: 200px"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
        @blur="handleFilter"
      />
      <el-input
        v-model="listQuery.email"
        placeholder="邮箱"
        prefix-icon="el-icon-search"
        style="width: 200px"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
        @blur="handleFilter"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        style="margin-left: 10px"
        @click="handleFilter"
      >
        查询
      </el-button>
      <userRoleAdd style="display:inline-block" @updateList="getList">
        <el-button
          class="filter-item"
          type="primary"
          icon="el-icon-edit"
          style="margin-left: 5px"
        >
          新增
        </el-button>
      </userRoleAdd>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      :default-sort="defaultSort"
      @sort-change="sortChange"
    >
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
      />
      <el-table-column label="用户名" width="230" align="center">
        <template slot-scope="{ row: { username } }">
          <span v-html="username" />
        </template>
      </el-table-column>
      <el-table-column label="昵称" width="230" align="center">
        <template slot-scope="{ row: { nickname } }">
          <span v-html="nickname" />
        </template>
      </el-table-column>
      <el-table-column label="用户头像" width="230" align="center">
        <template slot-scope="{ row: { avatar } }">
          <a v-if="avatar" :href="avatar" target="_blank">
            <img :src="avatar" style="width:120px;height:180px">
          </a>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="用户邮箱" align="center">
        <template slot-scope="{ row: { email } }">
          <span v-if="email" v-html="email" />
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template slot-scope="{ row }">
          <userRoleAdd
            style="display:inline-block;margin:0 10px;"
            :user-data="row"
            @updateList="getList"
          >
            <el-button type="text" icon="el-icon-edit" />
          </userRoleAdd>
          <el-button
            type="text"
            icon="el-icon-delete"
            style="color:#f56c6c"
            @click="handleDelete(row)"
          />
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pageSize"
      @pagination="refresh"
    />
  </div>
</template>

<script>
import Pagination from '../../components/Pagination/index'
import waves from '../../directive/waves/waves'
import { getUserRoleList, deleteUser } from '../../api/role1'
import userRoleAdd from './components/userAddRole'
export default {
  name: 'UserRole',
  directives: { waves },
  components: {
    userRoleAdd,
    Pagination
  },
  data() {
    return {
      tableKey: 0,
      list: [],
      listQuery: {},
      listLoading: true,
      defaultSort: {},
      total: 0
    }
  },
  created() {
    this.parseQuery(this.$route.query)
  },
  mounted() {
    this.getList()
  },
  beforeRouteUpdate(to, from, next) {
    if (to.path === from.path) {
      const newQuery = Object.assign({}, to.query)
      const oldQuery = Object.assign({}, from.query)
      if (JSON.stringify(newQuery) !== JSON.stringify(oldQuery)) {
        this.parseQuery(newQuery)
        this.getList()
      }
    }
    next()
  },
  methods: {
    // 调用查询接口
    getList(data) {
      this.listLoading = true
      getUserRoleList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.count
        if (
          this.listQuery.page * this.listQuery.pageSize >
          response.data.count
        ) {
          this.listQuery.page = Math.ceil(
            response.data.count / this.listQuery.pageSize
          )
          this.refresh()
        }
        this.list.forEach(user => {
          user.username = this.wrapperKeyword('username', user.username)
          user.nickname = this.wrapperKeyword('nickname', user.nickname)
          user.email = this.wrapperKeyword('email', user.email)
        })
        this.listLoading = false
      })
    },
    // 将参数写在路由地址中
    refresh() {
      this.$router.push({
        path: '/jurisdiction/userRole',
        query: this.listQuery
      })
    },
    // 查询事件
    handleFilter() {
      this.refresh()
    },
    // 排序事件
    sortChange(data) {
      const { prop, order } = data
      this.sortBy(prop, order)
    },
    sortBy(prop, order) {
      if (prop) {
        if (order === 'ascending') {
          this.listQuery.sort = `+${prop}`
        } else {
          this.listQuery.sort = `-${prop}`
        }
        this.handleFilter()
      }
    },
    // 删除事件
    handleDelete(data) {
      if (data.username) {
        this.$confirm('此操作将永久删用户，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            deleteUser(data).then(result => {
              this.$notify({
                title: '成功',
                message: result.msg || '删除成功',
                type: 'success',
                duration: 2000
              })
              if ((this.total - 1) % 10 === 0) {
                this.listQuery.page -= 1
              }
              this.getList()
            })
          })
          .catch(() => {
            console.info('取消删除操作')
          })
      }
    },
    parseQuery(_query) {
      const query = Object.assign({}, _query)
      let sort = '+id'
      const listQuery = {
        page: 1,
        pageSize: 10,
        sort
      }
      if (query) {
        query.page && (query.page = +query.page)
        query.pageSize && (query.pageSize = +query.pageSize)
        query.sort && (sort = query.sort)
      }
      const sortSymbol = sort[0]
      const sortColumn = sort.slice(1, sort.length)
      this.defaultSort = {
        prop: sortColumn,
        order: sortSymbol === '+' ? 'ascending' : 'descending'
      }
      this.listQuery = { ...listQuery, ...query }
    },
    // 被搜索到的内容高亮函数
    wrapperKeyword(k, v) {
      function highlight(value) {
        return `<span style="color: #1890ff" >${value}</span>`
      }
      if (!this.listQuery[k]) {
        return v
      } else {
        return v.replace(new RegExp(this.listQuery[k], 'ig'), v =>
          highlight(v)
        )
      }
    }
  }
}
</script>
<style scoped lang="scss">
.userRole {
  padding: 20px;
  .dialog {
    text-align: center;
  }
  img {
    width: 100px !important;
    height: 100px !important;
  }
}
</style>
