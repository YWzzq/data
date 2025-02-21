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
      component: () => import('../views/NewDataCleaningTaskView.vue')
    },
    {
      path: '/data-alignment',
      name: 'data-alignment',
      component: () => import('../views/DataAlignmentView.vue')
    },
    {
      path: '/data-alignment/new-task',
      name: 'new-data-alignment-task',
      component: () => import('../views/NewDataAlignmentTaskView.vue')
    },
    {
      path: '/data-deduplication',
      name: 'data-deduplication',
      component: () => import('../views/DataDeduplicationView.vue')
    },
    {
      path: '/data-deduplication/new-task',
      name: 'new-data-deduplication-task',
      component: () => import('../views/NewDataDeduplicationTaskView.vue')
    },
    {
      path: '/data-disambiguation',
      name: 'data-disambiguation',
      component: () => import('../views/DataDisambiguationView.vue')
    },
    {
      path: '/data-disambiguation/new-task',
      name: 'new-data-disambiguation-task',
      component: () => import('../views/NewDataDisambiguationTaskView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/data-generation/general',
      name: 'general-generation',
      component: () => import('../views/generation/GeneralGenerationView.vue')
    },
    {
      path: '/data-generation/general/create',
      name: 'create-general-generation',
      component: () => import('../views/generation/GeneralGenerationCreateView.vue')
    },
    {
      path: '/data-generation/general/:id',
      name: 'general-generation-detail',
      component: () => import('../views/generation/GenerationDetailView.vue')
    },
    {
      path: '/data-generation/general/:id/edit',
      name: 'edit-general-generation',
      component: () => import('../views/generation/EditGenerationView.vue')
    },
    {
      path: '/data-generation/finetune',
      name: 'finetune-generation',
      component: () => import('../views/generation/FinetuneGenerationView.vue')
    },
    {
      path: '/data-generation/finetune/create',
      name: 'create-finetune-generation',
      component: () => import('../views/generation/FinetuneGenerationCreateView.vue')
    },
    {
      path: '/data-generation/finetune/:id',
      name: 'finetune-generation-detail',
      component: () => import('../views/generation/GenerationDetailView.vue')
    },
    {
      path: '/data-generation/finetune/:id/edit',
      name: 'edit-finetune-generation',
      component: () => import('../views/generation/EditGenerationView.vue')
    }
  ]
})

export default router
