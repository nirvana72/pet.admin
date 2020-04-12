<template>
  <div class="app-container">
    <el-table :data="tableData" border>
      <el-table-column prop="uid" label="uid" width="180" />
      <el-table-column prop="realname" label="realname" width="180" />
      <el-table-column prop="role" label="role" />
      <el-table-column prop="lasttime" label="lasttime" />
      <el-table-column width="150">
        <template slot="header">
          <el-button type="primary" size="small" @click="command({cmd:'create',row:{}})">添加管理员</el-button>
        </template>
        <template slot-scope="scope">
          <el-dropdown trigger="click" type="primary" size="small" @command="command">
            <el-button type="primary">
              操作<i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="{cmd:'modify',row:scope.row}">修改</el-dropdown-item>
              <el-dropdown-item :command="{cmd:'delete',row:scope.row}">删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialog.visible" width="300px">
      <el-form>
        <el-form-item label="uid">
          <el-input v-model="dialog.data.uid" :disabled="dialog.status==='modify'" />
        </el-form-item>
        <el-form-item label="realname">
          <el-input v-model="dialog.data.realname" />
        </el-form-item>
        <el-form-item label="role">
          <el-select v-model="dialog.data.role" style="width:100%">
            <el-option label="admin" value="admin" />
            <el-option label="editor" value="editor" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogSubmit()">
          <span>{{ dialog.status }}</span>
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AdminUsers',
  data() {
    return {
      tableData: [],
      dialog: {
        visible: false,
        status: 'create',
        data: {}
      }
    }
  },
  created() {
    this.getAdminUsers()
  },
  methods: {
    getAdminUsers() {
      this.$Ajax({
        url: '/admin/admins/',
        method: 'get'
      }).then(res => {
        if (res.ret > 0) {
          this.tableData = res.list
        }
      })
    },
    command({ cmd, row }) {
      this['_' + cmd](row)
    },
    _create() {
      this.dialog.data = {}
      this.dialog.status = 'create'
      this.dialog.visible = true
    },
    _modify(row) {
      this.dialog.data = JSON.parse(JSON.stringify(row))
      this.dialog.status = 'modify'
      this.dialog.visible = true
    },
    _delete(row) {
      if (confirm(`确定要删除 ${row.realname} 么`)) {
        this.dialog.data = { uid: row.uid }
        this.dialog.status = 'delete'
        this.dialogSubmit()
      }
    },
    dialogSubmit() {
      const method = { 'create': 'post', 'modify': 'put', 'delete': 'delete' }[this.dialog.status]
      this.$Ajax({
        method: method, url: '/admin/admins/', data: this.dialog.data
      }).then(res => {
        if (res.ret > 0) {
          this.$message.success(`${method} success`)
          this.getAdminUsers()
        }
      }).finally(() => {
        this.dialog.visible = false
      })
    }
  }
}
</script>
