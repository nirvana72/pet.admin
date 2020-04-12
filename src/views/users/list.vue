<template>
  <div class="app-container my-users-list">
    <el-collapse>
      <el-collapse-item title="🔎">
        <el-form label-width="100px" style="width:400px">
          <el-form-item label="UID">
            <el-input v-model.trim="tableData.query.uid" maxlength="16" />
          </el-form-item>
          <el-form-item label="账号">
            <el-input v-model.trim="tableData.query.account" maxlength="16" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getList(1)">筛选</el-button>
          </el-form-item>
        </el-form>
      </el-collapse-item>
    </el-collapse>

    <div v-loading="loading">
      <el-table :data="tableData.list">
        <el-table-column prop="uid" label="uid" width="80" />
        <el-table-column label="avatar" width="120">
          <template slot-scope="scope">
            <img :src="converter.avatarPath(scope.row.avatar)" class="my-avatar" alt="">
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="nickname" />
        <el-table-column label="account">
          <template slot-scope="scope">
            <a href="#" style="text-decoration:underline" @click="show_command_dialog(scope.row)">{{ scope.row.account }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="mobile" label="mobile" />
        <el-table-column prop="email" label="email" />
        <el-table-column label="注册时间/上次登录">
          <template slot-scope="scope">
            {{ scope.row.writetime }}<br>
            {{ scope.row.lasttime }}
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        :current-page.sync="tableData.query.page"
        :page-size="tableData.query.limit"
        :total="tableData.count"
        layout="total, prev, pager, next"
        @current-change="getList"
      />

      <el-dialog
        :visible.sync="commandDialog.visible"
        :title="`${commandDialog.user.uid} - ${commandDialog.user.account} - ${commandDialog.user.nickname}`"
        width="400px"
      >
        <el-form label-width="80px">
          <el-form-item label="发布文章">
            <el-switch
              v-model="commandDialog.setting['article.publish']"
              active-value="1"
              inactive-value="0"
              @change="command_dialog_submit('article.publish')"
            />
          </el-form-item>
          <el-form-item label="回复评论">
            <el-switch
              v-model="commandDialog.setting['article.reply']"
              active-value="1"
              inactive-value="0"
              @change="command_dialog_submit('article.reply')"
            />
          </el-form-item>
          <el-form-item label="重置密码">
            <el-button type="primary" @click="command_dialog_submit('user.password')">重置密码</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { articleConvert } from '@/utils/tools'

export default {
  name: 'UsersList',
  data() {
    return {
      loading: false,
      tableData: {
        list: [],
        count: 0,
        query: {
          page: 1,
          limit: 10,
          uid: '',
          account: ''
        }
      },
      commandDialog: {
        visible: false,
        user: {}, // = table row
        setting: {
          'article.publish': '1', // 发布权限
          'article.reply': '1' // 回复权限
        }
      },
      ossHost: process.env.VUE_APP_oss_host,
      converter: articleConvert
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList(p) {
      if (p) this.tableData.query.page = p
      this.loading = true
      this.$Ajax({
        method: 'get', url: '/admin/users/',
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
    show_command_dialog(row) {
      this.commandDialog.user = row
      this.$Ajax({
        method: 'get', url: `/admin/users/${row.uid}/setting` // 获取用户属性表
      }).then(res => {
        if (res.ret > 0) {
          Object.keys(this.commandDialog.setting).forEach(key => {
            if (res.settings[key]) this.commandDialog.setting[key] = res.settings[key]
          })
          this.commandDialog.visible = true
        }
      })
    },
    command_dialog_submit(key) {
      this.$Ajax({
        method: 'put', url: `/admin/users/${this.commandDialog.user.uid}/setting`,
        data: { key, val: this.commandDialog.setting[key] | '' }
      }).then(res => {
        if (res.ret > 0) {
          this.$message.success('操作成功')
        }
      })
    }
  }
}
</script>

<style lang="scss">
.my-users-list{
  .my-avatar{
    width:50px;
    height:50px;
    border-radius:25px;
  }
  .my-dialog{
    width: 300px;
    margin: 0 auto;
  }
}
</style>
