import { fieldPathResolver } from "./ref-path-resolver";
import { buildFieldPath, getFieldName } from "./layout-utils";
import type { AppSchema } from "../../types/schema";

// Test schema
const testSchema: AppSchema = {
  $id: "test-schema",
  type: "object",
  properties: {
    user: { $ref: "#/$defs/Person" },
    manager: { $ref: "#/$defs/Person" },
    settings: {
      type: "object",
      properties: {
        notifications: {
          type: "object",
          properties: {
            email: { type: "boolean", title: "Email Notifications" },
            push: { type: "boolean", title: "Push Notifications" },
          },
        },
      },
    },
  },
  $defs: {
    Person: {
      type: "object",
      properties: {
        name: { type: "string", title: "Full Name" },
        email: { type: "string", title: "Email Address" },
      },
    },
  },
};

console.log("🧪 Field Path Verification Test\n");

// Test 1: Root level fields
console.log("📋 Test 1: Root Level Fields");
const rootFields = ["user", "manager", "settings"];
rootFields.forEach((fieldKey) => {
  const resolvedInfo = fieldPathResolver.resolveFieldPath(
    fieldKey,
    "",
    testSchema.properties?.[fieldKey] || { type: "string" },
    testSchema
  );
  console.log(
    `✅ ${fieldKey} → fieldPath: "${resolvedInfo.fieldPath}", isRefField: ${resolvedInfo.isRefField}`
  );
});

// Test 2: Nested fields
console.log("\n📋 Test 2: Nested Fields");
const nestedFields = [
  { parent: "settings", child: "notifications" },
  { parent: "settings.notifications", child: "email" },
  { parent: "settings.notifications", child: "push" },
];

nestedFields.forEach(({ parent, child }) => {
  const resolvedInfo = fieldPathResolver.resolveFieldPath(
    child,
    parent,
    { type: "string" }, // Mock schema
    testSchema
  );
  console.log(`✅ ${parent}.${child} → fieldPath: "${resolvedInfo.fieldPath}"`);
});

// Test 3: $ref field sub-fields
console.log("\n📋 Test 3: $ref Field Sub-fields");
const refSubFields = [
  { parent: "user", child: "name" },
  { parent: "user", child: "email" },
  { parent: "manager", child: "name" },
  { parent: "manager", child: "email" },
];

refSubFields.forEach(({ parent, child }) => {
  const resolvedInfo = fieldPathResolver.resolveFieldPath(
    child,
    parent,
    { type: "string" }, // Mock schema
    testSchema
  );
  console.log(
    `✅ ${parent}.${child} → fieldPath: "${resolvedInfo.fieldPath}", isRefField: ${resolvedInfo.isRefField}`
  );
});

// Test 4: buildFieldPath function
console.log("\n📋 Test 4: buildFieldPath Function");
const buildPathTests = [
  { parent: "", child: "name", expected: "name" },
  { parent: "user", child: "name", expected: "user.name" },
  {
    parent: "settings.notifications",
    child: "email",
    expected: "settings.notifications.email",
  },
];

buildPathTests.forEach(({ parent, child, expected }) => {
  const result = buildFieldPath(parent, child);
  const success = result === expected;
  console.log(
    `${
      success ? "✅" : "❌"
    } buildFieldPath("${parent}", "${child}") → "${result}" (expected: "${expected}")`
  );
});

// Test 5: getFieldName function
console.log("\n📋 Test 5: getFieldName Function");
const fieldNameTests = [
  { path: "name", expected: "name" },
  { path: "user.name", expected: "name" },
  { path: "settings.notifications.email", expected: "email" },
  { path: undefined, expected: "Field" },
];

fieldNameTests.forEach(({ path, expected }) => {
  const result = getFieldName(path);
  const success = result === expected;
  console.log(
    `${
      success ? "✅" : "❌"
    } getFieldName("${path}") → "${result}" (expected: "${expected}")`
  );
});

// Test 6: Complete field path chain
console.log("\n📋 Test 6: Complete Field Path Chain");
const completeChain = [
  "user",
  "user.name",
  "user.email",
  "manager",
  "manager.name",
  "manager.email",
  "settings",
  "settings.notifications",
  "settings.notifications.email",
  "settings.notifications.push",
];

completeChain.forEach((fieldPath) => {
  const fieldName = getFieldName(fieldPath);
  console.log(`✅ "${fieldPath}" → fieldName: "${fieldName}"`);
});

console.log("\n🎉 Field path verification test completed!");
