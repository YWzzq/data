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
    },
    {
      path: '/data-cleaning/new-task',
      name: 'new-data-cleaning-task',
      component: () => import('../views/NewDataCleaningTaskView.vue')},
      {path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/data-generation',
      name: 'data-generation',
      component: () => import('../views/DataGenerationView.vue'),
      children: [
        {
          path: 'general',
          name: 'general-generation',
          component: () => import('../views/generation/GeneralGenerationView.vue')
        },
        {
          path: 'general/create',
          name: 'create-general-generation',
          component: () => import('../views/generation/GeneralGenerationCreateView.vue')
        },
        {
          path: 'general/:id',
          name: 'general-generation-detail',
          component: () => import('../views/generation/GenerationDetailView.vue')
        },
        {
          path: 'general/:id/edit',
          name: 'edit-general-generation',
          component: () => import('../views/generation/EditGenerationView.vue')
        },
        {
          path: 'finetune',
          name: 'finetune-generation',
          component: () => import('../views/generation/FinetuneGenerationView.vue')
        },
        {
          path: 'finetune/create',
          name: 'create-finetune-generation',
          component: () => import('../views/generation/FinetuneGenerationCreateView.vue')
        },
        {
          path: 'finetune/:id',
          name: 'finetune-generation-detail',
          component: () => import('../views/generation/GenerationDetailView.vue')
        },
        {
          path: 'finetune/:id/edit',
          name: 'edit-finetune-generation',
          component: () => import('../views/generation/EditGenerationView.vue')
        }
      ]
    }
  ]
})

export default router
