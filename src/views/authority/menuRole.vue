<template>
  <div class="menuTable">
    <div class="title">
      <MenuAdd @updataList="getList">
        <el-button
          class="filter-item"
          type="primary"
          icon="el-icon-edit"
          style="margin-left: 5px"
        >新增</el-button>
      </MenuAdd>
    </div>
    <el-table
      :data="tableData"
      style="width: 100%;margin-bottom: 20px;"
      row-key="id"
      border
      default-expand-all
      :default-sort="defaultSort"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      @sort-change="sortChange"
    >
      <el-table-column
        prop="id"
        sortable="custom"
        label="ID"
        width="180"
        align="center"
      />
      <el-table-column
        prop="name"
        label="菜单名称"
        width="180"
        align="center"
      />
      <el-table-column
        prop="url"
        label="URL"
        align="center"
      />
      <el-table-column
        prop="pid"
        label="父菜单"
        width="180"
        align="center"
      />
      <el-table-column
        prop="sort"
        label="排序"
        width="180"
        align="center"
      />
      <el-table-column
        label="操作"
        width="120"
        align="center"
        fixed="right"
      >
        <template slot-scope="{ row }">
          <MenuAdd
            style="display:inline-block;margin:0 10px;"
            :add-menu-data="row"
            @updataList="getList"
          >
            <el-button
              type="text"
              icon="el-icon-document-add"
            />
          </MenuAdd>
          <MenuAdd
            style="display:inline-block;margin:0 10px;"
            :upadte-menu-data="row"
            @updataList="getList"
          >
            <el-button
              type="text"
              icon="el-icon-edit"
            />
          </MenuAdd>
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
import { getMenuList, deleteMenu } from '../../api/authority'
import { formatTree } from '../../utils/role'
import MenuAdd from './components/menuAdd'
export default {
  name: 'MenuRole',
  components: {
    MenuAdd
  },
  data() {
    return {
      tableData: [],
      listQuery: {},
      defaultSort: {},
      menuList: [],
      addParentId: '' // 新增时父菜单的id
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
    getList() {
      getMenuList(this.listQuery).then((res) => {
        this.tableData = formatTree(res.data)
      })
    },
    getMenId(data) {
      data.children.map((item) => {
        if (item.children) {
          this.menuList.push(item.id)
          this.getMenId(item)
        }
        this.menuList.push(item.id)
      })
    },
    // 删除表单事件
    async handleDelete(row) {
      this.menuList = []
      if (row.children) {
        this.getMenId(row)
      }
      this.menuList.push(row.id)
      const newRow = {
        id: row.id,
        name: row.name,
        pid: row.pid,
        sort: row.sort,
        children: this.menuList.join(',')
      }
      this.$confirm('此操作将永久删菜单，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteMenu(newRow).then((result) => {
          this.$notify({
            title: '成功',
            message: result.msg || '删除成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
      }).catch(() => {
        console.info('删除菜单成功')
      })
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
    // 查询事件
    handleFilter() {
      this.refresh()
    },
    refresh() {
      this.$router.push({
        path: '/authority/menuRole',
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
    }
  }
}
</script>
<style scoped lang="scss">
.menuTable {
  margin: 50px 30px;
  .dialog {
    text-align: center;
    margin-top: 30px;
  }
  .title {
    margin-bottom: 30px;
    text-align: right;
    display: flex;
    justify-content: flex-end;
  }
}

</style>
