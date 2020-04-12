import Layout from '@/layout'

const commentsRouter = {
  path: '/comments',
  component: Layout,
  name: 'Comments',
  meta: {
    title: 'comments',
    icon: 'message'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/comments/list'),
      name: 'CommentsList',
      meta: { title: 'comments-list' }
    }
  ]
}
export default commentsRouter
