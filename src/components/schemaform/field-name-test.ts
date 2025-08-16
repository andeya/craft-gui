import { getFieldName } from "./layout-utils";

// Test field name extraction
console.log("Field name extraction tests:");

const testCases = [
  { path: "user.name", key: "user.name", expected: "name" },
  { path: "profile.email", key: "profile.email", expected: "email" },
  { path: "args.filters.type", key: "args.filters.type", expected: "type" },
  {
    path: "settings.notifications.enabled",
    key: "settings.notifications.enabled",
    expected: "enabled",
  },
  { path: undefined, key: "simple", expected: "Field" },
  { path: undefined, key: undefined, expected: "Field" },
  {
    path: "deeply.nested.field.name",
    key: "deeply.nested.field.name",
    expected: "name",
  },
];

testCases.forEach(({ path, expected }) => {
  const result = getFieldName(path);
  const status = result === expected ? "✅" : "❌";
  console.log(
    `${status} "${path || "undefined"}" → "${result}" (expected: "${expected}")`
  );
});

// Test display name logic
console.log("\nDisplay name priority tests:");

const displayNameTests = [
  { title: "User Name", path: "user.name", expected: "User Name" },
  { title: undefined, path: "user.name", expected: "name" },
  { title: undefined, path: "profile.email", expected: "email" },
  { title: undefined, path: undefined, expected: "Field" },
];

displayNameTests.forEach(({ title, path, expected }) => {
  const fallbackName = getFieldName(path);
  const displayName = title || fallbackName;
  const status = displayName === expected ? "✅" : "❌";
  console.log(
    `${status} title: "${title || "undefined"}", path: "${
      path || "undefined"
    }" → "${displayName}" (expected: "${expected}")`
  );
});
