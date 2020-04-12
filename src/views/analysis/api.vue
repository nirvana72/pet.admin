<template>
  <div class="app-container">
    <line-chart v-if="lineChartData !== null" :chart-data="lineChartData" />

    <div class="my-select" style="text-align:center">
      <el-input v-model="tableData.query.writetime" class="input-with-select" placeholder="yyyy-mm-dd~yyyy-mm-dd" style="width:300px">
        <el-button slot="append" icon="el-icon-search" @click="reloadDate()" />
      </el-input>
    </div>

    <el-row :gutter="20">
      <el-col :span="12">
        <div style="background-color: #EEF0F3;padding:1px">
          <el-table :data="tableData.urlOrder" :show-header="false">
            <el-table-column type="index" width="50" />
            <el-table-column prop="url" />
            <el-table-column prop="count" width="100px" />
          </el-table>
        </div>
      </el-col>
      <el-col :span="6">
        <div style="background-color: #EEF0F3;padding:1px">
          <el-table :data="tableData.uidOrder" :show-header="false">
            <el-table-column type="index" width="50" />
            <el-table-column>
              <template slot-scope="scope">
                uid: {{ scope.row.uid }}
              </template>
            </el-table-column>
            <el-table-column prop="count" width="100px" />
          </el-table>
        </div>
      </el-col>
      <el-col :span="6">
        <div style="background-color: #EEF0F3;padding:1px">
          <el-table :data="tableData.ipOrder" :show-header="false">
            <el-table-column type="index" width="50" />
            <el-table-column prop="ip" />
            <el-table-column prop="count" width="100px" />
          </el-table>
        </div>
      </el-col>
    </el-row>

  </div>
</template>

<script>
import LineChart from './components/LineChart'
import { parseTime } from '@/utils/index.js'

export default {
  name: 'AnalysisApi',
  components: {
    LineChart
  },
  data() {
    return {
      tableData: {
        urlOrder: [],
        uidOrder: [],
        ipOrder: [],
        query: { writetime: '' }
      },
      lineChartData: null
    }
  },
  created() {
    const tmEn = new Date().getTime()
    const tmSt = tmEn - 3600 * 24 * 10 * 1000
    this.tableData.query.writetime = parseTime(tmSt, '{y}-{m}-{d}') + '~' + parseTime(tmEn, '{y}-{m}-{d}')

    this.reloadDate()
  },
  methods: {
    reloadDate() {
      this.getChartData()
      this.getTblData()
    },
    getChartData() {
      this.lineChartData = null
      this.$Ajax({
        method: 'get', url: '/admin/analysis/api/groupbyday'
      }).then(res => {
        if (res.ret > 0) {
          const chartData = { tags: [], vals: [] }
          res.list.forEach(row => {
            chartData.tags.push(row.tag)
            chartData.vals.push(row.val)
          })
          this.lineChartData = chartData
        }
      })
    },
    getTblData() {
      this.tableData.urlOrder = []
      this.tableData.uidOrder = []
      this.tableData.ipOrder = []
      this.$Ajax({
        method: 'get', url: '/admin/analysis/api/order', params: this.tableData.query
      }).then(res => {
        if (res.ret > 0) {
          this.tableData.urlOrder = res.urlOrder
          this.tableData.uidOrder = res.uidOrder
          this.tableData.ipOrder = res.ipOrder
        }
      })
    }
  }
}
</script>
