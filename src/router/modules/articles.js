import Layout from '@/layout'

const articlesRouter = {
  path: '/articles',
  component: Layout,
  name: 'Articles',
  meta: {
    title: 'Articles',
    icon: 'documentation',
    roles: ['editor']
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/articles/list.vue'),
      name: 'ArticlesList',
      meta: { title: 'articles-list' }
    },
    {
      path: 'edit',
      component: () => import('@/views/articles/edit.vue'),
      name: 'ArticlesEdit',
      meta: { title: 'articles-edit' }
    },
    {
      path: 'edit-image',
      component: () => import('@/views/articles/edit-image.vue'),
      name: 'ArticlesEditImage',
      meta: { title: 'articles-edit-image' },
      hidden: true
    },
    {
      path: 'edit-video',
      component: () => import('@/views/articles/edit-video.vue'),
      name: 'ArticlesEditVideo',
      meta: { title: 'articles-edit-video' },
      hidden: true
    },
    {
      path: 'edit-rich',
      component: () => import('@/views/articles/edit-rich.vue'),
      name: 'ArticlesEditRich',
      meta: { title: 'articles-edit-rich' },
      hidden: true
    }
  ]
}
export default articlesRouter
