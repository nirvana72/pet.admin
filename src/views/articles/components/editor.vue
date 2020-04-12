<template>
  <div class="app-container my-article-editor">
    <div v-if="Step !== 'create'" class="my-status">
      <el-alert v-if="status == 1" :closable="false" title="审核中" type="info" center show-icon />
      <el-alert v-else-if="status == 2" :closable="false" title="已发布" type="success" center show-icon />
      <el-alert v-else-if="status == 10" :closable="false" title="已拒绝" type="error" center show-icon />
      <el-alert v-else-if="status == 11" :closable="false" title="创建失败" type="warning" center show-icon />
      <el-alert v-else :closable="false" title="未知状态" type="error" center show-icon />
    </div>

    <div class="my-tabs">
      <slot name="preview" />
      <slot name="edit" />
      <slot name="code" />
    </div>

    <slot />

    <div v-if="Step !== 'finish'" class="my-btns">
      <el-button v-if="Step === 'verify'" type="success" @click="$emit('publish')">通过</el-button>
      <el-button v-if="Step === 'verify'" type="danger" @click="rejectDialog.visible = true">拒绝</el-button>
      <el-button v-if="Step === 'create'" type="success" @click="$emit('submit')">发布</el-button>
    </div>

    <div v-if="status == 10 || status == 11" class="my-btns">
      <el-button type="danger" @click="remove()">彻底删除</el-button>
    </div>

    <el-dialog v-if="Step !== 'finish'" :visible.sync="rejectDialog.visible" width="400px">
      <el-form>
        <el-radio-group v-model="rejectDialog.reason">
          <el-radio label="与主题无关内容" /><br>
          <el-radio label="敏感内容" /><br>
          <el-radio label="排版太乱" /><br>
        </el-radio-group>
        <br><br>
        <el-input v-model="rejectDialog.reason" :rows="2" type="textarea" />
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="reject()">拒绝</el-button>
      </div>
    </el-dialog>

    <form v-if="Step === 'create'" v-show="false" ref="uploadFrom">
      <input ref="imagefile" type="file" accept="image/gif, image/jpeg, image/png" multiple="multiple" @change="fileSelected('image')">
      <input ref="videofile" type="file" accept="video/mp4, video/mov" @change="fileSelected('video')">
    </form>
  </div>
</template>

<script>
import AliOss from 'ali-oss'

export default {
  props: {
    articleid: {
      type: [String, Number],
      default: -1
    },
    articletype: {
      type: String,
      default: 'none'
    }
  },
  data() {
    return {
      rejectDialog: {
        visible: false,
        reason: ''
      },
      ossHost: process.env.VUE_APP_oss_host,
      Step: 'finish',
      status: 99, // 0编辑状态, 1 审核中, 2 已发布, 10已拒绝, 11预发布状态
      fileMax: 1
    }
  },
  created() {
    if (this.articleid > 0) {
      this.getArticle(this.articleid)
    } else {
      this.Step = 'create'
      this.$emit('stepChange', this.Step)
      this.status = 0
    }
  },
  methods: {
    getArticle(Id) {
      this.$Ajax({
        method: 'get', url: '/admin/articles/' + Id
      }).then(res => {
        if (res.ret > 0) {
          this.status = Number(res.article.status)
          this.Step = this.status === 1 ? 'verify' : 'finish'
          this.$emit('stepChange', this.Step)
          this.$emit('getArticle', res.article)
        }
      })
    },
    fileSelect({ type, max }) {
      if (this.Step === 'create') {
        this.fileMax = max
        this.$refs[type + 'file'].click()
      } else {
        this.$message.warning('只能创建时添加资源')
      }
    },
    // input file 组件事件
    fileSelected(fileType) {
      const _files = []
      if (this.$refs[fileType + 'file'].files.length <= 0) { return }

      if (this.$refs[fileType + 'file'].files.length > this.fileMax) {
        this.$message.warning(`最多选择 ${this.fileMax} 个文件`)
        return
      }

      for (let i = 0, len = this.$refs[fileType + 'file'].files.length; i < len; i++) {
        const file = this.$refs[fileType + 'file'].files[i]
        const ext = file.name.split('.').pop().toLowerCase()

        if (fileType === 'image') {
          if (['jpg', 'jpeg', 'png', 'gif'].indexOf(ext) < 0) {
            this.$message.warning(`![${file.name}], 只支持 jpg,png,gif 文件`)
            break
          }
          if (file.size > (1024 * 1024 * 5)) {
            const size = (file.size / 1024 / 1024).toFixed(2)
            this.$message.warning(`size:[${size}M],图片文件最多支持5M以内`)
            break
          }
        }

        if (fileType === 'video') {
          if (['mp4', 'mov'].indexOf(ext) < 0) {
            this.$message.warning('只支持 mp4, mov 文件')
            break
          }
          if (file.size > (1024 * 1024 * 20)) {
            const size = (file.size / 1024 / 1024).toFixed(2)
            this.$message.warning(`size:[${size}M],视频文件最多支持20M以内`)
            break
          }
        }

        file.oss = {
          id: new Date().getTime(),
          type: fileType,
          ext,
          url: window.URL.createObjectURL(file)
        }
        _files.push(file)
      }
      this.$refs.uploadFrom.reset()
      if (_files.length > 0) {
        this.$emit('fileSelected', _files)
      }
    },
    publish({ title, content }) {
      if (!confirm('确定发布？')) return
      this.$Ajax({
        method: 'put', url: `/admin/articles/${this.articleid}/publish`,
        data: { title, content }
      }).then(res => {
        if (res.ret > 0) {
          this.$message.success('已发布')
          this.status = res.status
          this.Step = 'finish'
          this.$emit('stepChange', this.Step)
        }
      })
    },
    reject() {
      if (this.rejectDialog.reason === '') {
        this.$alert('必需有个理由', '', { type: 'error' })
        return
      }
      this.rejectDialog.visible = false
      this.$Ajax({
        method: 'put', url: `/admin/articles/${this.articleid}/reject`,
        data: { reason: this.rejectDialog.reason }
      }).then(res => {
        if (res.ret > 0) {
          this.$message.success('已拒绝')
          this.status = res.status
          this.Step = 'finish'
          this.$emit('stepChange', this.Step)
        }
      })
    },
    // 彻底删除
    remove() {
      if (!confirm('删除操作将彻底删除文章所有数据，包括OSS资源，确定操作？')) return
      this.$Ajax({
        method: 'delete', url: `/admin/articles/${this.articleid}/remove`
      }).then(res => {
        if (res.ret > 0) {
          this.$alert('删除成功', '', {
            type: 'success',
            showClose: false,
            callback: action => {
              this.$router.push({ path: '/articles/list' })
            }
          })
        }
      })
    },
    submit(_article) {
      this.loading = this.$loading({ lock: true, text: '正在发布...' })
      // 先创建一条记录， 得到记录ID
      this.$Ajax({
        method: 'post', url: '/app/articles/create',
        data: {
          title: _article.title,
          type: this.articletype
        }
      }).then(res => {
        if (res.ret > 0) {
          this.status = res.status
          _article.Id = res.Id
          _article.writetime = res.writetime
          if (_article.blobFiles.length > 0) {
            this._oss_upload(_article)
          } else {
            this._finish_post(_article)
          }
        } else {
          this.loading.close()
        }
      })
    },
    // 阿里ossAPI 上传资源
    _oss_upload: async function(_article) {
      const client = new AliOss({
        region: process.env.VUE_APP_oss_region,
        accessKeyId: process.env.VUE_APP_oss_accessKeyId,
        accessKeySecret: process.env.VUE_APP_oss_accessKeySecret,
        bucket: process.env.VUE_APP_oss_bucket
      })

      const yyyymm = _article.writetime.replace(new RegExp(/(-)/g), '').substr(0, 6)
      // 上传Blob数据
      for (let i = 1, len = _article.blobFiles.length; i <= len; i++) {
        const file = _article.blobFiles[i - 1]
        file.oss.name = `${i}.${file.oss.ext}`
        file.oss.path = `/articles/${yyyymm}/${_article.Id}/${file.oss.name}`
        const result = await client.put(file.oss.path, file)
        // console.log(result)
        if (result.res.status === 200) {
          this.$notify.success(`上传资源 ${i} / ${len} [${file.oss.type}]`)
          // 占位符替换成最终标签
          if (file.oss.type === 'image') {
            // eslint-disable-next-line require-atomic-updates
            _article.content = _article.content.replace('{' + file.oss.id + '}', '<img class="oss-block oss-image" src="' + this.ossHost + file.oss.path + '" />')
          }
          if (file.oss.type === 'video') {
            // eslint-disable-next-line require-atomic-updates
            _article.content = _article.content.replace('{' + file.oss.id + '}', '<video class="oss-block oss-video" src="' + this.ossHost + file.oss.path + '" controls="controls"></video>')
          }
        } else {
          this.$notify.error(`上传资源 ${i} / ${len} 失败 [${file.oss.type}]`)
        }
      }
      this._finish_post(_article)
    },
    _finish_post(_article) {
      const pathAry = []
      _article.blobFiles.forEach(f => {
        const duration = f.oss.duration ? f.oss.duration : 0
        pathAry.push(JSON.stringify({ type: f.oss.type, name: f.oss.name, duration: duration }))
      })
      this.$Ajax({
        method: 'put', url: `/app/articles/${this.articleid}/created`,
        data: {
          content: _article.content,
          medias: pathAry,
          status: 2 // 管理后台发布, 随机选择预设用户,前100名用户为机器人用户，专门发布文章用
        }
      }).then(res => {
        if (res.ret > 0) {
          this.$notify.success('发布成功')
          this.status = res.status
          this.Step = 'finish'
          this.$emit('stepChange', this.Step)
          this.$emit('submited', _article)
        }
      }).finally(() => {
        this.loading.close()
      })
    }
  }
}
</script>

<style lang="scss">
.my-article-editor {
  $width: 372px;
  $height: 700px;
  .my-status {
    width: $width;
    margin: 0 auto 10px auto;
  }
  .my-btns {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
  .my-tabs {
    display: flex;
    justify-content: center;
    .my-tab {
      width: $width;
      height: $height;
    }
  }
}
</style>
