import Layout from '@/layout'

const usersRouter = {
  path: '/users',
  component: Layout,
  name: 'Users',
  meta: {
    title: 'Users',
    icon: 'peoples'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/users/list'),
      name: 'UsersList',
      meta: { title: 'users-list', noCache: true }
    }
  ]
}
export default usersRouter
