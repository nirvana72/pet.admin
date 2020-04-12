<template>
  <div class="app-container my-article-list">
    <el-collapse>
      <el-collapse-item title="🔎">
        <el-form label-width="100px" style="width:400px">
          <el-form-item label="标题 | ID">
            <el-input v-model.trim="tableData.query.title_or_Id" maxlength="16" />
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="tableData.query.type" style="width:100%">
              <el-option label="所有" value="" />
              <el-option label="图文" value="image" />
              <el-option label="视频" value="video" />
              <el-option label="长贴" value="rich" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="tableData.query.status" style="width:100%">
              <el-option label="所有" value="" />
              <el-option label="审核中" value="1" />
              <el-option label="已发布" value="2" />
              <el-option label="已拒绝" value="10" />
            </el-select>
          </el-form-item>
          <el-form-item label="发表时间">
            <el-input v-model.trim="tableData.query.writetime" placeholder="yyyy-mm-dd~yyyy-mm-dd" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getList(1)">筛选</el-button>
          </el-form-item>
        </el-form>
      </el-collapse-item>
    </el-collapse>

    <div v-loading="loading">
      <el-table :data="tableData.list">
        <el-table-column label="title">
          <template slot-scope="scope">
            <a href="#" @click="on_row_command({cmd:'click-title', row:scope.row})">
              <b>{{ scope.row.Id }}</b> - {{ scope.row.title.length > 30 ?scope.row.title.substr(0, 25) + ' •••' : scope.row.title }}
            </a>
          </template>
        </el-table-column>
        <el-table-column label="type" width="100px">
          <template slot-scope="scope">
            <span v-if="scope.row.type == 'image'">图文</span>
            <span v-if="scope.row.type == 'video'">视频</span>
            <span v-if="scope.row.type == 'rich'">长贴</span>
          </template>
        </el-table-column>
        <el-table-column label="author(id)" width="250px">
          <template slot-scope="scope">
            {{ scope.row.authorname }} ({{ scope.row.authorId }})
          </template>
        </el-table-column>
        <el-table-column label="status" width="150px">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status == 1">审核中</el-tag>
            <el-tag v-else-if="scope.row.status == 2" type="success">已发布</el-tag>
            <el-tag v-else-if="scope.row.status == 10" type="danger">已拒绝</el-tag>
            <el-tag v-else-if="scope.row.status == 11" type="warning">创建失败</el-tag>
            <el-tag v-else type="danger">未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="writetime" label="writetime" width="180px" />
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
  name: 'ArticlesList',
  data() {
    return {
      loading: false,
      tableData: {
        list: [],
        count: 0,
        query: {
          page: 1,
          limit: 10,
          title_or_Id: '',
          type: '',
          status: '',
          writetime: ''
        }
      }
    }
  },
  created() {
    const tmEn = new Date().getTime()
    const tmSt = tmEn - 3600 * 24 * 15 * 1000
    this.tableData.query.writetime = parseTime(tmSt, '{y}-{m}-{d}') + '~' + parseTime(tmEn, '{y}-{m}-{d}')

    this.getList()
  },
  methods: {
    getList(p) {
      if (p) this.tableData.query.page = p

      if (this.tableData.query.writetime !== '') {
        const tm = this.tableData.query.writetime
        if (!(
          /^~\d{4}-\d{2}-\d{2}$/.test(tm) ||
          /^\d{4}-\d{2}-\d{2}~$/.test(tm) ||
          /^\d{4}-\d{2}-\d{2}~\d{4}-\d{2}-\d{2}$/.test(tm))) {
          this.$alert('日期时间不正确', '', { type: 'error' })
          return
        }
      }

      this.loading = true
      this.$Ajax({
        method: 'get', url: '/admin/articles/',
        params: this.tableData.query
      }).then(res => {
        if (res.ret > 0) {
          this.tableData.list = res.list
          this.tableData.count = res.count
        }
      }).finally(() => {
        this.loading = false
      })
    },
    on_row_command({ cmd, row }) {
      switch (cmd) {
        case 'click-title': {
          this.$router.push({ path: `/articles/edit-${row.type}`, query: { Id: row.Id }})
          break
        }
      }
    }
  }
}
</script>
