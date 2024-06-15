import { useRoute } from "vue-router"
/**
 * This hook used for meta typings in route
 */
export const useTypedRoute = <Type = Record<string | number | symbol, unknown>>() => {
  const route = useRoute();
  const routeMeta = route.meta as Type;
  return {
    ...route,
    meta: routeMeta
  }
}