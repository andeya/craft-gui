<template>
  <q-page class="q-pa-md">
    <!-- Navigation Controls -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Navigation Controls</div>
        <div class="row q-gutter-sm">
          <q-btn color="primary" @click="goBack" icon="arrow_back">
            Back
          </q-btn>
          <q-btn color="secondary" @click="goTo('/')" icon="home"> Home </q-btn>
        </div>
      </q-card-section>
    </q-card>

    <!-- Route Statistics -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Route Statistics</div>
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label>Total Routes</q-item-label>
              <q-item-label caption>{{ allRoutes.length }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Menu Routes</q-item-label>
              <q-item-label caption>{{ menuRoutes.length }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Depth 1 Routes</q-item-label>
              <q-item-label caption>{{ depth1Routes.length }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- All Routes Table -->
    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6">All Routes</div>
        <q-table
          :rows="allRoutes"
          :columns="routeColumns"
          row-key="path"
          flat
          bordered
          :pagination="{ rowsPerPage: 100 }"
          class="routes-table"
          header-class="table-header"
          style="
            --q-table-header-font-size: 16px;
            --q-table-header-font-weight: 700;
            --q-table-header-bg: #f5f5f5;
            --q-table-header-color: #1976d2;
          "
        >
          <template v-slot:body="props">
            <q-tr :props="props" @click="onRowClick($event, props.row)">
              <q-td key="icon" :props="props">
                <q-icon :name="RouteMeta.getIconName(props.row.meta)" />
              </q-td>
              <q-td key="title" :props="props">
                {{ RouteMeta.getTitle(props.row.meta) }}
              </q-td>
              <q-td key="path" :props="props">
                {{ props.row.path }}
              </q-td>
              <q-td key="name" :props="props">
                {{ props.row.name || "N/A" }}
              </q-td>
              <q-td key="order" :props="props">
                {{ props.row.meta?.order || 0 }}
              </q-td>
              <q-td key="showInMenu" :props="props">
                <q-icon
                  :name="props.row.meta?.showInMenu ? 'check_circle' : 'cancel'"
                  :color="props.row.meta?.showInMenu ? 'positive' : 'negative'"
                />
              </q-td>
              <q-td key="description" :props="props">
                {{ props.row.meta?.description || "" }}
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Route Testing -->
    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6">Route Testing</div>
        <div class="row q-gutter-sm q-mb-md">
          <q-input
            v-model="testPath"
            label="Test Path"
            dense
            outlined
            class="col-12 col-md-4"
          />
          <q-btn color="primary" @click="testRoute" label="Test Route" />
        </div>
        <div v-if="testResult" class="text-body2">
          <pre>{{ JSON.stringify(testResult, null, 2) }}</pre>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouteManager } from "../composables/useRouteManager";

import { useNavigation } from "../composables/useNavigation";
import { RouteMeta } from "../types/route-meta";

// Use route manager API directly
const {
  allRoutes,
  menuRoutes,
  depth1Routes,
  findRouteByPath,
  checkRouteExists,
} = useRouteManager();

// Get navigation methods (must be in setup function)
const { goTo, goBack } = useNavigation();

// Test route functionality
const testPath = ref("/");
const testResult = ref<any>(null);

// Table columns definition
const routeColumns = [
  {
    name: "icon",
    label: "Icon",
    field: "icon",
    align: "center" as const,
  },
  {
    name: "title",
    label: "Title",
    field: (row: any) => RouteMeta.getTitle(row.meta),
    sortable: true,
    align: "left" as const,
  },
  {
    name: "path",
    label: "Path",
    field: "path",
    sortable: true,
    align: "left" as const,
  },
  {
    name: "name",
    label: "Name",
    field: "name",
    sortable: true,
    align: "left" as const,
  },
  {
    name: "order",
    label: "Order",
    field: (row: any) => row.meta?.order || 0,
    sortable: true,
    align: "center" as const,
  },
  {
    name: "showInMenu",
    label: "Show in Menu",
    field: (row: any) => row.meta?.showInMenu || false,
    sortable: true,
    align: "center" as const,
  },
  {
    name: "description",
    label: "Description",
    field: (row: any) => row.meta?.description || "",
    align: "left" as const,
  },
];

function onRowClick(_evt: any, row: any) {
  goTo(row.path);
}

function testRoute() {
  const route = findRouteByPath(testPath.value);
  const exists = checkRouteExists(testPath.value);

  testResult.value = {
    path: testPath.value,
    exists,
    route: route
      ? {
          path: route.path,
          name: route.name,
          meta: route.meta,
        }
      : null,
  };
}
</script>

<script lang="ts">
// Route metadata
export const meta = {
  title: "Route Map",
  icon: "router",
  description: "global router utilities",
};
</script>

<style>
.routes-table {
  font-size: 14px;
}

.routes-table .q-table__top,
.routes-table .q-table__bottom,
.routes-table thead th,
.routes-table tbody td {
  font-size: 14px;
}

.routes-table .q-table__top {
  font-size: 16px;
}

/* Table header styles - more prominent */
.routes-table thead th,
.routes-table .q-table thead th,
.routes-table .q-table__thead th {
  font-size: 16px !important;
  font-weight: 700 !important;
  background-color: #f5f5f5 !important;
  color: #1976d2 !important;
  border-bottom: 2px solid #1976d2 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  padding: 12px 8px !important;
}

/* Ensure table header styles are not overridden */
.routes-table .q-table thead tr th,
.routes-table .q-table__thead tr th {
  font-size: 16px !important;
  font-weight: 700 !important;
  background-color: #f5f5f5 !important;
  color: #1976d2 !important;
  border-bottom: 2px solid #1976d2 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
}

/* Quasar table specific header styles */
.q-table thead th {
  font-size: 16px !important;
  font-weight: 700 !important;
  background-color: #f5f5f5 !important;
  color: #1976d2 !important;
  border-bottom: 2px solid #1976d2 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
}

/* More specific selectors */
.q-table .q-table__thead th,
.q-table thead tr th {
  font-size: 16px !important;
  font-weight: 700 !important;
  background-color: #f5f5f5 !important;
  color: #1976d2 !important;
  border-bottom: 2px solid #1976d2 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
}

/* Styles using header-class */
.table-header {
  font-size: 16px !important;
  font-weight: 700 !important;
  background-color: #f5f5f5 !important;
  color: #1976d2 !important;
  border-bottom: 2px solid #1976d2 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
}

.table-header th {
  font-size: 16px !important;
  font-weight: 700 !important;
  background-color: #f5f5f5 !important;
  color: #1976d2 !important;
  border-bottom: 2px solid #1976d2 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
}

/* Use CSS variables to override Quasar default styles */
.routes-table {
  --q-table-header-font-size: 16px !important;
  --q-table-header-font-weight: 700 !important;
  --q-table-header-bg: #f5f5f5 !important;
  --q-table-header-color: #1976d2 !important;
}

/* Directly override Quasar table header styles */
.routes-table .q-table__thead th,
.routes-table .q-table thead th {
  font-size: 16px !important;
  font-weight: 700 !important;
  background-color: #f5f5f5 !important;
  color: #1976d2 !important;
  border-bottom: 2px solid #1976d2 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
}

/* Mouse hover effects */
.routes-table tbody tr:hover {
  background-color: #f0f8ff !important;
  cursor: pointer;
}

.routes-table tbody tr:hover td {
  background-color: #f0f8ff !important;
}
</style>
