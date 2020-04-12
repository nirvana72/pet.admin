<template>
  <div class="app-container my-article-edit">
    <div class="itm">
      <el-button style="background-color:#009688;border:0;" circle @click="$router.push({path:'/articles/edit-image'})">
        <svg-icon icon-class="image" />
      </el-button>
      <label>图文</label>
    </div>
    <div class="itm">
      <el-button style="background-color:#F44336;border:0;" circle @click="$router.push({path:'/articles/edit-video'})">
        <svg-icon icon-class="video" />
      </el-button>
      <label>视频</label>
    </div>
    <div class="itm">
      <el-button style="background-color:#9C27B0;border:0;" circle @click="$router.push({path:'/articles/edit-rich'})">
        <svg-icon icon-class="app" />
      </el-button>
      <label>长贴</label>
    </div>
  </div>
</template>

<style lang="scss">
  .my-article-edit {
    display: flex;
    justify-content: center;
    margin-top: 200px;
    .el-button{
      width: 100px;
      height: 100px;
      font-size: 30px;
      margin: 0 30px;
    }
    .itm{
      text-align: center;
      label{
        display: block;
        margin-top:20px;
      }
    }
  }
</style>

