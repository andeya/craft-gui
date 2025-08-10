import { createRouter, createWebHistory } from "vue-router";
import { generateRoutes } from "../utils/auto-routes";

const routes = generateRoutes();

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
