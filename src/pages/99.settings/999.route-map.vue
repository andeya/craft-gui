<template>
  <QPage class="q-pa-md">
    <!-- Route Testing -->
    <QCard class="q-mb-md">
      <QCardSection>
        <div class="text-h6">Route Testing</div>
        <div class="row q-gutter-sm q-mb-md">
          <QInput
            v-model="testPath"
            label="Test Path"
            dense
            outlined
            class="col-12 col-md-4"
          />
          <QBtn color="primary" @click="testRoute" label="Test Route" />
        </div>
        <div v-if="testResult" class="text-body2">
          <pre>{{ JSON.stringify(testResult, null, 2) }}</pre>
        </div>
      </QCardSection>
    </QCard>
    <!-- Route Statistics -->
    <QCard class="q-mb-md">
      <QCardSection>
        <div class="text-h6">Route Statistics</div>
        <QList>
          <QItem>
            <QItemSection>
              <QItemLabel>Total Routes</QItemLabel>
              <QItemLabel caption>{{ routes.length }}</QItemLabel>
            </QItemSection>
          </QItem>
          <QItem>
            <QItemSection>
              <QItemLabel>Menu Routes</QItemLabel>
              <QItemLabel caption>{{ menuRoutes.length }}</QItemLabel>
            </QItemSection>
          </QItem>
          <QItem>
            <QItemSection>
              <QItemLabel>Depth 1 Routes</QItemLabel>
              <QItemLabel caption>{{ depth1Routes.length }}</QItemLabel>
            </QItemSection>
          </QItem>
          <QItem>
            <QItemSection>
              <QItemLabel>Route Groups</QItemLabel>
              <QItemLabel caption>{{ routeGroupInfos.length }}</QItemLabel>
            </QItemSection>
          </QItem>
        </QList>
      </QCardSection>
    </QCard>

    <!-- Route Groups Tables -->
    <div v-for="group in routeGroupInfos" :key="group.title" class="q-mt-md">
      <QCard>
        <QCardSection>
          <div class="text-h6">
            {{ group.title }} ({{ group.routes.length }} routes)
            <QChip
              :label="`Order: ${group.order}`"
              color="primary"
              size="sm"
              class="q-ml-sm text-white"
            />
          </div>
          <QTable
            :rows="group.routes"
            :columns="routeInfoColumns"
            row-key="path"
            flat
            bordered
            :pagination="{ rowsPerPage: 0 }"
            hide-pagination
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
              <QTr :props="props" @click="$router.push(props.row.path)">
                <QTd key="icon" :props="props">
                  <QIcon :name="props.row.icon" />
                </QTd>
                <QTd key="title" :props="props">
                  {{ props.row.title }}
                </QTd>
                <QTd key="path" :props="props">
                  {{ props.row.path }}
                </QTd>
                <QTd key="order" :props="props">
                  {{ props.row.order || 0 }}
                </QTd>
                <QTd key="showInMenu" :props="props">
                  <QIcon
                    :name="props.row.showInMenu ? 'check_circle' : 'cancel'"
                    :color="props.row.showInMenu ? 'positive' : 'negative'"
                  />
                </QTd>
                <QTd key="description" :props="props">
                  {{ props.row.description || "" }}
                </QTd>
              </QTr>
            </template>
          </QTable>
        </QCardSection>
      </QCard>
    </div>
  </QPage>
</template>

<script setup lang="ts">
import { ref } from "vue";

import {
  findRouteByPath,
  checkRouteExists,
  getRoutesByDepth,
} from "@/composables/route";
import { routes, menuRoutes, routeGroupInfos } from "@/router/auto-routes";

const depth1Routes = getRoutesByDepth(1);

// Test route functionality
const testPath = ref("/");
const testResult = ref<any>(null);

// Table columns definition for route groups
const routeInfoColumns = [
  {
    name: "icon",
    label: "Icon",
    field: "icon",
    align: "center" as const,
  },
  {
    name: "title",
    label: "Title",
    field: "title",
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
    name: "order",
    label: "Order",
    field: "order",
    sortable: true,
    align: "center" as const,
  },
  {
    name: "showInMenu",
    label: "Show in Menu",
    field: "showInMenu",
    sortable: true,
    align: "center" as const,
  },
  {
    name: "description",
    label: "Description",
    field: "description",
    align: "left" as const,
  },
];

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
