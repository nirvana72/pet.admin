<template>
  <div class="app-container my-analysis-user">
    <div class="my-bg-panel">
      <h3>用户注册统计({{ lineChartReg.show }})</h3>
      <div class="my-btns">
        <el-radio-group v-model="lineChartReg.show" size="small" @change="getData('Reg')">
          <el-radio-button label="year">年</el-radio-button>
          <el-radio-button label="month">月</el-radio-button>
          <el-radio-button label="day">日</el-radio-button>
        </el-radio-group>
      </div>
      <line-chart v-if="lineChartReg.year !== null" v-show="lineChartReg.show === 'year'" :chart-data="lineChartReg.year" />
      <line-chart v-if="lineChartReg.month !== null" v-show="lineChartReg.show === 'month'" :chart-data="lineChartReg.month" />
      <line-chart v-if="lineChartReg.day !== null" v-show="lineChartReg.show === 'day'" :chart-data="lineChartReg.day" />
    </div>
    <div class="my-bg-panel">
      <h3>用户活跃度统计({{ lineChartAct.show }})</h3>
      <div class="my-btns">
        <el-radio-group v-model="lineChartAct.show" size="small" @change="getData('Act')">
          <el-radio-button label="year">年</el-radio-button>
          <el-radio-button label="month">月</el-radio-button>
          <el-radio-button label="day">日</el-radio-button>
        </el-radio-group>
      </div>
      <line-chart v-if="lineChartAct.year !== null" v-show="lineChartAct.show === 'year'" :chart-data="lineChartAct.year" />
      <line-chart v-if="lineChartAct.month !== null" v-show="lineChartAct.show === 'month'" :chart-data="lineChartAct.month" />
      <line-chart v-if="lineChartAct.day !== null" v-show="lineChartAct.show === 'day'" :chart-data="lineChartAct.day" />
    </div>
  </div>
</template>

<script>
import LineChart from './components/LineChart'

export default {
  name: 'AnalysisUser',
  components: {
    LineChart
  },
  data() {
    return {
      lineChartReg: {
        show: 'month',
        year: null,
        month: null,
        day: null
      },
      lineChartAct: {
        show: 'month',
        year: null,
        month: null,
        day: null
      }
    }
  },
  created() {
    this.getData('Reg')
    this.getData('Act')
  },
  methods: {
    // val = Reg | Act
    getData(val) {
      if (this['lineChart' + val][this['lineChart' + val].show] === null) {
        this.$Ajax({
          method: 'get', url: '/admin/analysis/user/' + val.toLowerCase(), params: { type: this['lineChart' + val].show }
        }).then(res => {
          if (res.ret > 0) {
            const chartData = { tags: [], vals: [] }
            res.list.forEach(row => {
              chartData.tags.push(row.tag)
              chartData.vals.push(row.val)
            })
            this['lineChart' + val][this['lineChart' + val].show] = chartData
          }
        })
      }
    }
  }
}
</script>

<style lang="scss">
.my-analysis-user{
  background-color: #EEF0F3;
  .my-bg-panel{
    background-color: #FFFFFF;
    padding:20px 25px 20px 20px;
    margin-bottom:50px;
    text-align:center;
    position:relative;
    .my-btns{
      position:absolute;
      right:60px;
      top:20px
    }
  }
}
</style>
