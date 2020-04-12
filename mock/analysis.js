import Mock from 'mockjs'

function getCommonDate(type) {
  const list = []
  const date = new Date()
  if (type === 'year') {
    let yyyy = date.getFullYear() - 1
    let mm = date.getMonth() + 1
    for (let i = 0; i < 12; i++) {
      mm++
      if (mm > 12) {
        mm = 1
        yyyy++
      }
      list.push({
        tag: yyyy + '-' + (mm < 10 ? '0' : '') + mm,
        val: Mock.Random.integer(100, 200)
      })
    }
  }
  if (type === 'month') {
    let mm = date.getMonth()
    let dd = date.getDate()
    for (let i = 0; i < 30; i++) {
      dd++
      if (dd > 30) {
        dd = 1
        mm++
      }

      list.push({
        tag: mm + '.' + (dd < 10 ? '0' : '') + dd,
        val: Mock.Random.integer(100, 200)
      })
    }
  }
  if (type === 'day') {
    let hh = date.getHours()
    for (let i = 0; i < 24; i++) {
      hh++
      if (hh > 24) {
        hh = 1
      }

      list.push({
        tag: (hh < 10 ? '0' : '') + hh + ':00',
        val: Mock.Random.integer(100, 200)
      })
    }
  }
  return list
}

export default [
  {
    url: '/admin/analysis/api/groupbyday',
    type: 'get',
    response: config => {
      const list = []
      const date = new Date()

      let mm = date.getMonth()
      let dd = date.getDate()
      for (let i = 0; i < 30; i++) {
        dd++
        if (dd > 30) {
          dd = 1
          mm++
        }

        list.push({
          tag: mm + '.' + (dd < 10 ? '0' : '') + dd,
          val: Mock.Random.integer(100, 200)
        })
      }

      return {
        ret: 1,
        msg: 'success',
        list
      }
    }
  },
  {
    url: '/admin/analysis/api/order',
    type: 'get',
    response: config => {
      const ret = {
        ret: 1,
        msg: 'success',
        urlOrder: [],
        uidOrder: [],
        ipOrder: []
      }
      let len = Mock.Random.integer(10, 20)
      for (let i = 0; i < len; i++) {
        ret.urlOrder.push({
          url: Mock.Random.url(),
          count: Mock.Random.integer(100, 500)
        })
      }
      len = Mock.Random.integer(10, 20)
      for (let i = 0; i < len; i++) {
        ret.uidOrder.push({
          uid: Mock.Random.integer(1000, 2000),
          count: Mock.Random.integer(100, 500)
        })
      }
      len = Mock.Random.integer(10, 20)
      for (let i = 0; i < len; i++) {
        ret.ipOrder.push({
          ip: Mock.Random.ip(),
          count: Mock.Random.integer(100, 500)
        })
      }
      return ret
    }
  },
  {
    url: '/admin/analysis/user/reg',
    type: 'get',
    response: config => {
      const list = getCommonDate(config.query.type)
      return {
        ret: 1,
        msg: 'success',
        list
      }
    }
  },
  {
    url: '/admin/analysis/user/act',
    type: 'get',
    response: config => {
      const list = getCommonDate(config.query.type)
      return {
        ret: 1,
        msg: 'success',
        list
      }
    }
  }
]
