<template>
  <div class="app-container">
    <div class="my-select" style="text-align:center">
      <el-input v-model="tableData.query.day" placeholder="yyyy-mm-dd" style="width:300px">
        <el-button slot="prepend" @click="timeChange('minus')">&lt;</el-button>
        <div slot="append">
          <el-button @click="timeChange('plus')">&gt;</el-button>
          <el-button icon="el-icon-search" @click="getList(1)" />
        </div>
      </el-input>
    </div>

    <div v-loading="loading">
      <el-pagination
        :current-page.sync="tableData.query.page"
        :page-size="tableData.query.limit"
        :total="tableData.count"
        layout="total, prev, pager, next"
        @current-change="getList"
      />

      <el-table
        :data="tableData.list"
        :show-header="false"
        :row-style="{'height': '60px'}"
        @cell-mouse-enter="cellMouseEnter"
        @cell-mouse-leave="tableData.hoverId=-1"
      >
        <el-table-column width="150px">
          <template slot-scope="scope">
            #{{ scope.row.Id }} - @{{ scope.row.uid }}
          </template>
        </el-table-column>
        <el-table-column width="30px">
          <template slot-scope="scope">
            <span v-show="scope.row.status === '0'" style="color:red">●</span>
          </template>
        </el-table-column>
        <el-table-column>
          <template slot-scope="scope">
            <span :style="{'text-decoration':scope.row.status === '0' ? 'line-through':'none'}">{{ scope.row.content }}</span>
          </template>
        </el-table-column>
        <el-table-column width="60px">
          <template slot-scope="scope">
            <el-button
              v-show="scope.row.status === '1' && tableData.hoverId === scope.row.Id"
              type="danger"
              icon="el-icon-delete"
              circle
              size="mini"
              title="删除评论"
              @click="reject(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="writetime" width="180px" />
      </el-table>

      <el-pagination
        :current-page.sync="tableData.query.page"
        :page-size="tableData.query.limit"
        :total="tableData.count"
        layout="total, prev, pager, next"
        @current-change="getList"
      />
    </div>
  </div>
</template>

<script>
import { parseTime } from '@/utils/index.js'
export default {
  name: 'CommentsList',
  data() {
    return {
      loading: false,
      tableData: {
        list: [],
        count: 0,
        hoverId: -1,
        query: { page: 1, limit: 20, day: '' }
      }
    }
  },
  created() {
    const tmEn = new Date().getTime()
    this.tableData.query.day = parseTime(tmEn, '{y}-{m}-{d}')

    this.getList()
  },
  methods: {
    // how = plus | minus
    timeChange(how) {
      let tm = new Date(this.tableData.query.day).getTime()
      tm = tm + (3600 * 24 * 1000 * (how === 'plus' ? 1 : -1))
      this.tableData.query.day = parseTime(tm, '{y}-{m}-{d}')
      this.getList(1)
    },
    getList(p) {
      if (p) this.tableData.query.page = p
      this.loading = true
      this.$Ajax({
        method: 'get', url: '/admin/comments/', params: this.tableData.query
      }).then(res => {
        if (res.ret > 0) {
          this.tableData.list = res.list
          this.tableData.count = res.count
        }
      }).finally(() => {
        this.loading = false
      })
    },
    reject(row) {
      if (!confirm('确定删除这条评论？')) return
      this.$Ajax({
        method: 'put', url: `/admin/comments/${row.Id}/reject`
      }).then(res => {
        if (res.ret > 0) {
          row.status = '0'
        }
      })
    },
    cellMouseEnter(row, column, cell, event) {
      this.tableData.hoverId = row.Id
    }
  }
}
</script>
