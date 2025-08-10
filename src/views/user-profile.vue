<template>
  <q-page
    class="flex column items-center justify-center q-pa-md"
    style="min-height: 100vh"
  >
    <div class="text-center max-width-600">
      <h1 class="text-h3 q-mb-md">User Profile</h1>
      <p class="text-body1 q-mb-lg">
        This is the user profile page, testing automatic route naming conversion
      </p>

      <div class="row q-gutter-md justify-center q-mb-lg">
        <q-card class="col-12 col-sm-6">
          <q-card-section>
            <div class="text-h6">Basic Information</div>
            <q-input v-model="userInfo.name" label="Name" class="q-mb-md" />
            <q-input v-model="userInfo.email" label="Email" type="email" />
          </q-card-section>
        </q-card>

        <q-card class="col-12 col-sm-6">
          <q-card-section>
            <div class="text-h6">Contact Information</div>
            <q-input v-model="userInfo.phone" label="Phone" class="q-mb-md" />
            <q-input v-model="userInfo.address" label="Address" />
          </q-card-section>
        </q-card>
      </div>

      <q-btn color="primary" @click="$router.push('/')"> Back to Home </q-btn>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";

// User profile data
const userInfo = ref({
  name: "张三",
  email: "zhangsan@example.com",
  phone: "13800138000",
  address: "北京市朝阳区",
});
</script>

<script lang="ts">
// Route metadata
export const meta = {
  title: "User Profile",
  icon: "account_circle",
  showInMenu: true,
  description: "Manage user profile information",
  order: 6,
};
</script>
