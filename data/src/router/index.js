import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DatasetView from '../views/DatasetView.vue'
import DataSourceView from '../views/DataSourceView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/datasets',
      name: 'datasets',
      component: DatasetView
    },
    {
      path: '/datasources',
      name: 'datasources',
      component: DataSourceView
    },
    {
      path: '/datasets/create',
      name: 'create-dataset',
      component: () => import('../views/dataset/CreateDatasetView.vue'),
      children: [
        {
          path: '',
          name: 'create-dataset-info',
          component: () => import('../views/dataset/CreateDatasetInfoView.vue')
        },
        {
          path: 'import',
          name: 'create-dataset-import',
          component: () => import('../views/dataset/CreateDatasetImportView.vue')
        }
      ]
    },
    {
      path: '/datasets/:id',
      name: 'dataset-detail',
      component: () => import('../views/dataset/DatasetDetailView.vue')
    },
    {
      path: '/datasets/:id/edit',
      name: 'edit-dataset',
      component: () => import('../views/dataset/EditDatasetView.vue')
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: () => import('../views/TaskView.vue')
    },
    {
      path: '/labels',
      name: 'labels',
      component: () => import('../views/LabelView.vue')
    },
    {
      path: '/annotation',
      name: 'annotation',
      component: () => import('../views/AnnotationView.vue')
    },
    {
      path: '/data-cleaning',
      name: 'data-cleaning',
      component: () => import('../views/DataCleaningView.vue')
    }
  ]
})

export default router
