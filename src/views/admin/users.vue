<template>
  <q-page class="q-pa-md">
    <div class="text-center q-mb-lg">
      <h1 class="text-h3">User Management</h1>
      <p class="text-body1">Manage system users and permissions</p>
    </div>

    <q-table
      title="Users"
      :rows="users"
      :columns="columns"
      row-key="id"
      class="q-mb-md"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round color="primary" icon="edit" size="sm" />
          <q-btn flat round color="negative" icon="delete" size="sm" />
        </q-td>
      </template>
    </q-table>

    <div class="q-mt-md">
      <q-btn color="primary" @click="$router.push('/admin')">
        Back to Admin
      </q-btn>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";

// Sample user data
const users = ref([
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    status: "Active",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "User",
    status: "Inactive",
  },
]);

const columns = [
  { name: "name", label: "Name", field: "name", sortable: true },
  { name: "email", label: "Email", field: "email", sortable: true },
  { name: "role", label: "Role", field: "role", sortable: true },
  { name: "status", label: "Status", field: "status", sortable: true },
  { name: "actions", label: "Actions", field: "actions" },
];
</script>

<script lang="ts">
// Route metadata
export const meta = {
  title: "User Management",
  icon: "people",
  showInMenu: true,
  description: "Manage system users and permissions",
  order: 11,
};
</script>
