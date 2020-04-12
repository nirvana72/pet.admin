import Layout from '@/layout'

const analysisRouter = {
  path: '/analysis',
  component: Layout,
  name: 'Analysis',
  meta: {
    title: 'analysis',
    icon: 'chart'
  },
  children: [
    {
      path: 'user',
      component: () => import('@/views/analysis/user'),
      name: 'AnalysisUser',
      meta: { title: 'analysis-user' }
    },
    {
      path: 'api',
      component: () => import('@/views/analysis/api'),
      name: 'AnalysisApi',
      meta: { title: 'analysis-api' }
    }
  ]
}
export default analysisRouter
