import Layout from '@/layout'

const adminRouter = {
  path: '/admin',
  component: Layout,
  name: 'Admin',
  meta: {
    title: 'Admin',
    icon: 'setup',
    roles: ['admin']
  },
  children: [
    {
      path: 'users',
      component: () => import('@/views/admin/users'),
      name: 'AdminUsers',
      meta: { title: 'admin-users' }
    },
    {
      path: 'setting',
      component: () => import('@/views/admin/setting'),
      name: 'AdminSetting',
      meta: { title: 'admin-setting' }
    }
  ]
}
export default adminRouter
