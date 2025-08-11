<template>
  <q-page class="q-pa-md">
    <div class="text-center q-mb-lg">
      <h1 class="text-h3">Analytics Reports</h1>
      <p class="text-body1">View detailed analytics and performance metrics</p>
    </div>

    <div class="row q-gutter-md">
      <q-card class="col-12 col-sm-6 col-md-3">
        <q-card-section>
          <div class="text-h6">Page Views</div>
          <div class="text-h4 text-primary">12,345</div>
          <div class="text-caption">+15% from last month</div>
        </q-card-section>
      </q-card>

      <q-card class="col-12 col-sm-6 col-md-3">
        <q-card-section>
          <div class="text-h6">Unique Users</div>
          <div class="text-h4 text-positive">8,234</div>
          <div class="text-caption">+8% from last month</div>
        </q-card-section>
      </q-card>

      <q-card class="col-12 col-sm-6 col-md-3">
        <q-card-section>
          <div class="text-h6">Bounce Rate</div>
          <div class="text-h4 text-warning">23%</div>
          <div class="text-caption">-5% from last month</div>
        </q-card-section>
      </q-card>

      <q-card class="col-12 col-sm-6 col-md-3">
        <q-card-section>
          <div class="text-h6">Avg. Session</div>
          <div class="text-h4 text-info">4m 32s</div>
          <div class="text-caption">+12% from last month</div>
        </q-card-section>
      </q-card>
    </div>

    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6">Traffic Sources</div>
        <div class="row q-gutter-sm">
          <div class="col-12 col-sm-6 col-md-3">
            <div class="text-body1">Direct: 45%</div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="text-body1">Organic: 30%</div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="text-body1">Social: 15%</div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="text-body1">Referral: 10%</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="q-mt-md">
      <q-btn color="primary" @click="$router.push('/admin')">
        Back to Admin
      </q-btn>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// Analytics component logic
</script>

<script lang="ts">
// Route metadata - automatically set showInMenu=true and order=20 via filename prefix 020.analytics.vue
export const meta = {
  title: "Analytics Reports",
  icon: "analytics",
  description: "View detailed analytics and performance metrics",
};
</script>
