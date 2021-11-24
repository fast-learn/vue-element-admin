<template>
  <div class="role">
    <div class="title">
      <RoleFormDialog @updataList="getList">
        <el-button
          class="filter-item"
          type="primary"
          icon="el-icon-edit"
          style="margin-left: 5px"
        >新增</el-button>
      </RoleFormDialog>
    </div>
    <el-table
      :data="roleList"
      row-key="id"
      border
      :default-sort="defaultSort"
      @sort-change="sortChange"
    >
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
      />
      <el-table-column
        label="角色名称"
        prop="name"
        align="center"
      />
      <el-table-column
        label="操作"
        width="120"
        align="center"
        fixed="right"
      >
        <template slot-scope="{ row }">
          <div style="display:inline-block;margin:0 10px">
            <RoleFormDialog :update-role="row" @updataList="getList">
              <el-button
                type="text"
                icon="el-icon-edit"
              />
            </RoleFormDialog>
          </div>
          <el-button
            type="text"
            icon="el-icon-delete"
            style="color:#f56c6c"
            @click="handleDelete(row)"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getRoleList, deleteRole } from '../../api/role1'
import RoleFormDialog from './components/roleAdd'
export default {
  name: 'Role',
  components: {
    RoleFormDialog
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
  data() {
    return {
      defaultSort: {},
      roleList: [],
      listQuery: {}
    }
  },
  created() {
    this.parseQuery(this.$route.query)
  },
  mounted() {
    this.getList()
  },
  methods: {
    getList() {
      getRoleList(this.listQuery).then((res) => {
        this.roleList = res.data
      })
    },
    // 删除角色
    handleDelete(data) {
      this.$confirm('此操作将永久删角色，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteRole(data).then((result) => {
          this.$notify({
            title: '成功',
            message: result.msg || '删除成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
      }).catch((params) => {
        console.info('删除菜单成功')
      })
    },
    refresh() {
      this.$router.push({
        path: '/jurisdiction/role',
        query: this.listQuery
      })
    },
    parseQuery(_query) {
      const query = Object.assign({}, _query)
      let sort = '+id'
      const listQuery = {
        sort
      }
      if (query) {
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
    // 查询事件
    handleFilter() {
      this.refresh()
    }
  }
}
</script>
<style scoped lang="scss">
.role {
  margin: 20px;
  .title{
    margin-bottom:30px;
    text-align: right;
  }
}
</style>
