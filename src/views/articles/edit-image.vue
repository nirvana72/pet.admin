<template>
  <article-editor
    ref="articleEditor"
    :articleid="Article.Id"
    articletype="image"
    class="my-article-image"
    @getArticle="getArticle"
    @fileSelected="fileSelected"
    @submit="submit"
    @publish="publish"
    @stepChange="stepChange"
  >

    <div slot="edit" class="my-tab my-edit">
      <div class="my-images">
        <div v-for="(file, index) in Article.blobFiles" :key="index" class="my-image">
          <img :src="file.oss.url" @click="imgPreview(file.oss.url)">
          <el-button v-if="Step === 'create'" class="my-del" circle @click="Article.blobFiles.splice(index, 1)">
            <svg-icon icon-class="x" />
          </el-button>
        </div>
        <div v-if="Step === 'create' && Article.blobFiles.length < 9" class="my-image my-add">
          <el-button style="border:0;font-size:30px" circle @click="fileSelect()">
            <svg-icon icon-class="plus" />
          </el-button>
        </div>
      </div>
      <el-input v-model="Article.title" :rows="10" :disabled="Step === 'finish'" type="textarea" placeholder="写点什么吧..." />
    </div>

    <el-dialog :visible.sync="imgDialog.visible" width="50%" center>
      <img :src="imgDialog.src" style="width:100%">
    </el-dialog>
  </article-editor>
</template>

<script>
import articleEditor from './components/editor.vue'

export default {
  name: 'ArticlesEditImage',
  components: {
    'article-editor': articleEditor
  },
  data() {
    return {
      Article: {
        Id: -1,
        title: '',
        content: '',
        blobFiles: [],
        writetime: ''
      },
      imgDialog: {
        visible: false,
        src: ''
      },
      Step: 'finish'
    }
  },
  created() {
    this.Article.Id = this.$route.query.Id || -1
  },
  methods: {
    getArticle(_article) {
      this.Article.title = _article.title

      const yyyymm = _article.writetime.replace(new RegExp(/(-)/g), '').substr(0, 6)
      const osspath = `${process.env.VUE_APP_oss_host}/articles/${yyyymm}/${_article.Id}/`
      _article.images.forEach(fname => {
        this.Article.blobFiles.push({ oss: { url: osspath + fname }})
      })
    },
    fileSelect() {
      const max = 9 - this.Article.blobFiles.length
      this.$refs.articleEditor.fileSelect({ type: 'image', max })
    },
    fileSelected(files) {
      files.forEach(f => {
        this.Article.blobFiles.push(f)
      })
    },
    publish() {
      const params = {
        title: this.Article.title,
        content: ''
      }
      this.$refs.articleEditor.publish(params)
    },
    submit() {
      if (this.Article.blobFiles.length < 1) {
        this.$alert('请至少选择一张图片', '', { type: 'error' })
        return
      }

      if (this.Article.title.trim() === '') {
        this.$alert('写点什么吧...', '', { type: 'error' })
        return
      }

      this.$refs.articleEditor.submit(this.Article)
    },
    stepChange(_step) {
      this.Step = _step
    },
    imgPreview(src) {
      this.imgDialog.visible = true
      this.imgDialog.src = src
    }
  }
}
</script>

<style lang="scss">
.my-article-image{
  $imgsize: 103px;
  .my-edit{
    border:1px #CCCCCC solid;
    padding: 20px 10px 20px 20px;
    .my-images {
      .my-image {
        width: $imgsize;
        height: $imgsize;
        position: relative;
        margin: 0 10px 10px 0;
        float: left;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px #dfdfe1 solid;
        background-color: #ffffff;
        img {
          max-width: $imgsize - 2;
          max-height: $imgsize - 2;
          z-index: 1;
        }
        .my-del {
          position: absolute;
          top: -10px;
          right: -10px;
          padding: 0px;
          width: 20px;
          height: 20px;
          z-index: 2;
          background-color:#F56C6C;
          border: 0;
        }
      }
      .my-add {
        border: 1px #1f1f1f dashed;
        button {
          width: 100%;
          height: 100%;
        }
      }
    }
    .el-textarea{
      padding-right:10px;
      textarea{
        color:#000;
      }
    }
  }
}
</style>
