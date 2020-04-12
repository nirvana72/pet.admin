<template>
  <article-editor
    ref="articleEditor"
    :articleid="Article.Id"
    articletype="video"
    class="my-article-video"
    @getArticle="getArticle"
    @fileSelected="fileSelected"
    @submit="submit"
    @publish="publish"
    @stepChange="stepChange"
  >

    <div slot="edit" class="my-tab my-edit">
      <div class="my-images">
        <div v-if="Article.blobFiles.length > 0" style="text-align:center">
          <video ref="videoTag" :src="Article.blobFiles[0].oss.url" controls="controls" />
          <el-button v-if="Step === 'create'" style="background-color:#F56C6C;border:0;margin:10px 0 50px 0;" circle @click="Article.blobFiles.splice(0, 1)">
            <svg-icon icon-class="x" />
          </el-button>
        </div>
        <div v-if="Step === 'create' && Article.blobFiles.length < 1" class="my-image my-add">
          <el-button style="border:0;font-size:30px" circle @click="fileSelect()">
            <svg-icon icon-class="plus" />
          </el-button>
        </div>
      </div>
      <el-input v-model="Article.title" :rows="10" :disabled="Step === 'finish'" type="textarea" placeholder="写点什么吧..." />
    </div>
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
      this.Article.blobFiles.push({ oss: { url: osspath + _article.videos[0].fname }})
    },
    fileSelect() {
      this.$refs.articleEditor.fileSelect({ type: 'video', max: 1 })
    },
    fileSelected(files) {
      this.Article.blobFiles.push(files[0])
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
        this.$alert('未添加视频', '', { type: 'error' })
        return
      }

      if (this.Article.title.trim() === '') {
        this.$alert('写点什么吧...', '', { type: 'error' })
        return
      }
      // 提交的时候，把视频时长带上
      this.Article.blobFiles[0].oss.duration = this.$refs.videoTag.duration
      this.$refs.articleEditor.submit(this.Article)
    },
    stepChange(_step) {
      this.Step = _step
    }
  }
}
</script>

<style lang="scss">
.my-article-video {
  $imgsize: 100px;
  .my-edit {
    border: 1px #cccccc solid;
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
      }
      .my-add {
        border: 1px #1f1f1f dashed;
        button {
          width: 100%;
          height: 100%;
        }
      }
    }
    video {
      width: 100%;
      max-height: 300px;
      padding: 0 10px 10px 0;
    }
    .el-textarea {
      padding-right: 10px;
      textarea {
        color: #000;
      }
    }
  }
}
</style>
