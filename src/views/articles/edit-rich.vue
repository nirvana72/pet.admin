<template>
  <article-editor
    ref="articleEditor"
    :articleid="Article.Id"
    articletype="rich"
    class="my-article-rich"
    @getArticle="getArticle"
    @fileSelected="fileSelected"
    @submit="submit"
    @submited="submited"
    @publish="publish"
    @stepChange="stepChange"
  >

    <div slot="preview" class="my-tab my-preview">
      <div class="my-screen">
        <h3>{{ Article.title }}</h3>
        <div class="my-content" v-html="Content" />
      </div>
    </div>

    <div v-if="Step !== 'finish'" slot="edit" class="my-tab my-edit">
      <el-input v-model="Article.title" class="my-title" placeholder="输入标题..." maxlength="32" minlength="4" />
      <quill-editor
        ref="myQuillEditor"
        v-model="Content"
        :options="editorOption"
      />
    </div>

    <div v-if="Step !== 'finish'" slot="code" class="my-tab my-code">
      <textarea readonly v-text="Content" />
    </div>

  </article-editor>
</template>

<script>
import articleEditor from './components/editor.vue'
import 'quill/dist/quill.snow.css'
import { quillEditor } from 'vue-quill-editor'
import _Quill from 'quill'

export default {
  name: 'ArticlesEditRich',
  components: {
    'article-editor': articleEditor,
    quillEditor
  },
  data() {
    const _this = this
    return {
      Content: '',
      Step: 'finish',
      Article: {
        Id: -1,
        title: '',
        content: '',
        blobFiles: [],
        writetime: ''
      },
      editorOption: {
        formats: ['underline', 'color', 'background', 'align', 'bold', 'header', 'italic', 'list', 'image', 'video', 'indent'],
        modules: {
          toolbar: {
            container: [
              ['image', 'video'],
              ['bold', 'italic', 'underline'], // toggled buttons
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              [{ 'indent': '-1' }, { 'indent': '+1' }], // outdent/indent
              [{ 'color': [] }, { 'background': [] }], // dropdown with defaults from theme
              [{ 'align': [] }],
              ['clean']
            ],
            handlers: {
              'image': function() {
                _this.$refs.articleEditor.fileSelect({ type: 'image', max: 1 })
              },
              'video': function() {
                _this.$refs.articleEditor.fileSelect({ type: 'video', max: 1 })
              }
            }
          },
          clipboard: {
            matchVisual: false
          }
        }
      }
    }
  },
  created() {
    this.Article.Id = this.$route.query.Id || -1

    if (!_Quill.MediaBlot_registered) {
      this._registerQuillBlot()
      _Quill.MediaBlot_registered = true
    }
  },
  methods: {
    getArticle(_article) {
      this.Article.title = _article.title
      this.Content = _article.content
    },
    fileSelected(files) {
      this.Article.blobFiles.push(files[0])
      const pos = this.$refs.myQuillEditor.quill.getSelection().index
      this.$refs.myQuillEditor.quill.insertEmbed(pos, files[0].oss.type, files[0].oss)
    },
    publish() {
      const params = {
        title: this.Article.title,
        content: this.Content
      }
      this.$refs.articleEditor.publish(params)
    },
    submit() {
      if (this.Article.title.trim() === '') {
        this.$alert('请输入标题', '', { type: 'error' })
        return
      }
      // 资源检测
      this.Article.content = this.Content
      let mediaTags = []
      const vidTags = this.Article.content.match(/<video data-ossid="(.*?)<\/video>/g)
      if (vidTags && vidTags.length > 0) {
        if (vidTags.length > 1) {
          this.$alert('最多添加1个视频', '', { type: 'error' })
          return
        }
        mediaTags = mediaTags.concat(vidTags)
      }

      const imgTags = this.Article.content.match(/<img data-ossid="(.*?)(?:>|\/>)/gi)
      if (imgTags === null || imgTags.length <= 0) {
        this.$alert('至少添加1张本地图片作为封面', '', { type: 'error' })
        return
      }
      if (imgTags.length > 9) {
        this.$alert('最多添加9张图片', '', { type: 'error' })
        return
      }
      mediaTags = mediaTags.concat(imgTags)
      // -------------------------------------------
      // 正则提取属性， 把标签替换成点位符
      if (mediaTags.length > 0) {
        const attrReg = /data-ossid=[\"]?([^\"]*)[\"]?/i
        const refOssIds = []
        mediaTags.forEach(tag => {
          if (this.Article.content.indexOf(tag) >= 0) {
            const attr = tag.match(attrReg)
            this.Article.content = this.Article.content.replace(tag, '{' + attr[1] + '}')
            refOssIds.push(Number(attr[1]))
          }
        })
        // 添加资源又删除标签操作，此处过滤正文中不存在的本地资源
        const refFiles = this.Article.blobFiles.filter((f) => {
          return refOssIds.indexOf(f.oss.id) >= 0
        })
        this.Article.blobFiles = refFiles
      }
      this.$refs.articleEditor.submit(this.Article)
    },
    submited(_article) {
      this.Content = _article.content
    },
    stepChange(_step) {
      this.Step = _step
    },
    _registerQuillBlot() {
      const BlockEmbed = _Quill.import('blots/block/embed')
      class MyVideo extends BlockEmbed {
        static create(value) {
          const node = document.createElement('video')
          if (typeof value !== 'string') {
            node.setAttribute('data-ossid', value.id)
            node.setAttribute('src', value.url)
          } else {
            node.setAttribute('src', value)
          }
          node.setAttribute('class', 'oss-block oss-video')
          node.setAttribute('controls', 'controls')
          return node
        }
        static value(domNode) {
          return domNode.getAttribute('src')
        }
      }
      MyVideo.blotName = 'video'
      MyVideo.tagName = 'video'
      _Quill.register(MyVideo)
      // ---------------------------------
      class MyImage extends BlockEmbed {
        static create(value) {
          const node = document.createElement('img')
          if (typeof value !== 'string') {
            node.setAttribute('data-ossid', value.id)
            node.setAttribute('src', value.url)
          } else {
            node.setAttribute('src', value)
          }
          node.setAttribute('class', 'oss-block oss-image')
          return node
        }
        static value(domNode) {
          return domNode.getAttribute('src')
        }
      }
      MyImage.blotName = 'image'
      MyImage.tagName = 'img'
      _Quill.register(MyImage)
    }
  }
}
</script>

<style lang="scss">
.my-article-rich{
  $height:700px;
  $border:1px #CCCCCC solid;
  .my-edit{
    .my-title{
      input{
        border-radius: 0;
        border:$border;
      }
    }
    .quill-editor{
      margin-top:-1px;
      .ql-editor{
        height:$height - 106;
      }
      .ql-container{
        font-size: 16px;
        color:#000;
        img, video{
          max-height: 100px;
          display: block;
          background-color: #999999;
        }
        p{
          margin-bottom: 15px;
        }
      }
    }
  }
  .my-code {
    textarea {
      width:100%;
      height:$height;
      resize:none;
      padding:20px;
      margin-left:-1px;
      border:$border;
      background-color: #f5f5f5;
    }
  }
  .my-preview{
    font-size: 16px;
    margin-right:-1px;
    border:$border;
    height:$height;
    overflow-y: auto;
    background-color: #f5f5f5;
    .my-screen{
      white-space:normal;
      word-break:break-all;
      word-wrap:break-word;
      padding:0 20px;
      line-height: 25px;
      .oss-block, img{
        width: 100%;
        margin:20px 0;
        display: block;
      }
      .oss-video{
        max-height:250px;
        background-color: #999999;
      }
    }
  }
}
</style>
