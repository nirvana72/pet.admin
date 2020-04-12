export const articleConvert = {
  // 生成OSS地址
  ossPath: function(writetime, AId, fname, host = true) {
    const yyyymm = writetime.replace(new RegExp(/(-)/g), '').substr(0, 6)
    let path = `/articles/${yyyymm}/${AId}/${fname}`
    if (host) {
      path = process.env.VUE_APP_oss_host + path
    }
    return path
  },
  // 生成头像地址
  avatarPath: function(avatar, thumb = true) {
    avatar = Number(avatar)
    let url = ''
    if (avatar < 100) {
      url = process.env.VUE_APP_oss_host + '/avatar/' + avatar + '.png'
    } else {
      const groupId = Math.floor(avatar / 1000) * 1000
      url = process.env.VUE_APP_oss_host + '/avatar/' + groupId + '/' + avatar + '.png'
    }
    url += thumb ? this.AliOssThumb['img3'] : this.AliOssThumb['avatar']
    return url
  },
  AliOssThumb: {
    'avatar': '?x-oss-process=style/avatar',
    'video': '?x-oss-process=video/snapshot,w_300,h_180,t_5000,m_fast',
    'img1': '?x-oss-process=style/thumb300_180',
    'img2': '?x-oss-process=style/thumb150_120',
    'img3': '?x-oss-process=style/thumb100_100'
  }
}
