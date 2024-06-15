import { createRouter, createWebHistory } from 'vue-router'

export enum RouteNames {
  Login = 'login',
  Home = 'home',
  Stats = 'stats',
  Channels = 'channels',
  Clients = 'clients',
  Messenger = 'messenger',
  Tasks = 'tasks',
  Mailing = 'mailing',
  Profile = 'profile',
  Players = 'players',
}
export const DEFAULT_ROUTE = RouteNames.Messenger

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/components/layout/BaseLayout.vue'),
      children: [
        {
          path: '',
          name: RouteNames.Home,
          component: () => import('../views/HomeView.vue'),
        },
        {
          path: 'stats',
          name: RouteNames.Stats,
          component: () => import('../views/StatsView.vue'),
        },
        {
          path: 'channels',
          name: RouteNames.Channels,
          component: () => import('../views/ChannelsView.vue'),
        },
        {
          path: 'clients',
          name: RouteNames.Clients,
          component: () => import('../views/ClientsView/ClientsView.vue'),
        },
        {
          path: 'messenger',
          name: RouteNames.Messenger,
          component: () => import('../views/MessengerView.vue'),
        },
        {
          path: 'players',
          name: RouteNames.Players,
          component: () => import('../views/PlayersView.vue'),
        },
        {
          path: 'tasks',
          name: RouteNames.Tasks,
          component: () => import('../views/TasksView.vue'),
        },
        {
          path: 'mailing',
          name: RouteNames.Mailing,
          component: () => import('../views/MailingView.vue'),
        },
        {
          path: 'profile',
          name: RouteNames.Profile,
          component: () => import('../views/Profile.vue'),
        },
      ],
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/',
      component: () => import('../views/auth/Layout.vue'),
      children: [
        {
          path: 'login',
          name: RouteNames.Login,
          component: () => import('../views/auth/LoginView.vue'),
        },
      ],
      meta: {
        requiresAuth: false,
      },
    },
  ],
})

export default router
