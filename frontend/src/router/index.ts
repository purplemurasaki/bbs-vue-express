import { createRouter, createWebHistory } from 'vue-router'

import PostsList from '../pages/PostsList.vue'
import PostCreate from '../pages/PostCreate.vue'
import PostEdit from '../pages/PostEdit.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'posts', component: PostsList },
    { path: '/posts/new', name: 'post-new', component: PostCreate },
    { path: '/posts/:id/edit', name: 'post-edit', component: PostEdit },
  ],
})

