function getSessionFromLocalstorage() {
  const session = localStorage.getItem('app.session')
  if (session) {
    return JSON.parse(session)
  }
  return {
    uid: -1,
    realname: '',
    avatar: 1,
    lasttime: '',
    role: '',
    token: '',
    refreshtoken: ''
  }
}

const state = {
  session: getSessionFromLocalstorage()
}

const mutations = {
  SET_SESSION(state, _session) {
    Object.keys(state.session).forEach(key => {
      if (_session[key]) state.session[key] = _session[key]
    })
    localStorage.setItem('app.session', JSON.stringify(state.session))
  },
  CLEAR_SESSION(state) {
    localStorage.removeItem('app.session')
    state.session = getSessionFromLocalstorage()
  }
}

const actions = {
  setSession({ commit }, data) {
    commit('SET_SESSION', data)
  },
  clearSession({ commit }) {
    commit('CLEAR_SESSION')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

