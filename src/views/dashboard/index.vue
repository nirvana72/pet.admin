<template>
  <div class="app-container" style="text-align:center;padding-top:100px">
    <label style="font-size:5em">welcome </label>
    <br><br><br><br><br><br>
    <el-badge :value="me.role" class="item">
      <label style="font-size:4em">{{ me.realname }}</label>
    </el-badge>
    <br><br>
    <div>lasttime: {{ me.lasttime }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      me: null
    }
  },
  created() {
    this.me = this.$store.getters.session
  }
}
</script>
