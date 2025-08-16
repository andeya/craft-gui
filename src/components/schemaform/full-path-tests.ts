import { fieldPathResolver } from "./ref-path-resolver";
import { getFieldName } from "./layout-utils";
import type { AppSchema } from "../../types/schema";
import { resolveSchemaRef } from "../../utils/schema-utils";

// Test schema with $ref objects
const testSchema = {
  $id: "test-schema",
  type: "object",
  properties: {
    user: { $ref: "#/$defs/Person" },
    manager: { $ref: "#/$defs/Person" },
    profile: { $ref: "#/$defs/Person" },
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
        age: { type: "number", title: "Age" },
      },
    },
  },
} as AppSchema;

// Expected field paths from schema traversal
const expectedFields = [
  "user",
  "manager",
  "profile",
  "settings",
  "settings.notifications",
  "settings.notifications.email",
  "settings.notifications.push",
  "user.name",
  "user.email",
  "user.age",
  "manager.name",
  "manager.email",
  "manager.age",
  "profile.name",
  "profile.email",
  "profile.age",
];

// Full schema traversal with path resolution
function traverseSchemaWithPaths(schema: AppSchema): Array<{
  fieldPath: string;
  fieldName: string;
  parentPath: string;
  title?: string;
  isRefField: boolean;
  refPath?: string;
}> {
  const results: Array<{
    fieldPath: string;
    fieldName: string;
    parentPath: string;
    title?: string;
    isRefField: boolean;
    refPath?: string;
  }> = [];

  // First, traverse root level properties
  if (schema.properties) {
    Object.entries(schema.properties).forEach(([key, propSchema]) => {
      const resolvedInfo = fieldPathResolver.resolveFieldPath(
        key,
        "",
        propSchema,
        schema
      );

      results.push({
        fieldPath: resolvedInfo.fieldPath,
        fieldName: resolvedInfo.fieldName,
        parentPath: resolvedInfo.parentPath,
        title: propSchema.title,
        isRefField: resolvedInfo.isRefField,
        refPath: resolvedInfo.refPath,
      });

      // If it's a $ref field, also add its sub-fields
      if (resolvedInfo.isRefField && resolvedInfo.refPath) {
        const refSchema = resolveSchemaRef(propSchema, schema as AppSchema);
        if (refSchema.properties) {
          Object.entries(refSchema.properties).forEach(
            ([subKey, subSchema]) => {
              const subResolvedInfo = fieldPathResolver.resolveFieldPath(
                subKey,
                key,
                subSchema as AppSchema,
                schema
              );

              results.push({
                fieldPath: subResolvedInfo.fieldPath,
                fieldName: subResolvedInfo.fieldName,
                parentPath: subResolvedInfo.parentPath,
                title: (subSchema as AppSchema).title,
                isRefField: subResolvedInfo.isRefField,
                refPath: subResolvedInfo.refPath,
              });
            }
          );
        }
      }

      // If it's a nested object, traverse its properties
      if (propSchema.type === "object" && propSchema.properties) {
        Object.entries(propSchema.properties).forEach(([subKey, subSchema]) => {
          const subResolvedInfo = fieldPathResolver.resolveFieldPath(
            subKey,
            key,
            subSchema,
            schema
          );

          results.push({
            fieldPath: subResolvedInfo.fieldPath,
            fieldName: subResolvedInfo.fieldName,
            parentPath: subResolvedInfo.parentPath,
            title: subSchema.title,
            isRefField: subResolvedInfo.isRefField,
            refPath: subResolvedInfo.refPath,
          });

          // Handle nested object properties
          if (subSchema.type === "object" && subSchema.properties) {
            Object.entries(subSchema.properties).forEach(
              ([nestedKey, nestedSchema]) => {
                const nestedResolvedInfo = fieldPathResolver.resolveFieldPath(
                  nestedKey,
                  `${key}.${subKey}`,
                  nestedSchema,
                  schema
                );

                results.push({
                  fieldPath: nestedResolvedInfo.fieldPath,
                  fieldName: nestedResolvedInfo.fieldName,
                  parentPath: nestedResolvedInfo.parentPath,
                  title: nestedSchema.title,
                  isRefField: nestedResolvedInfo.isRefField,
                  refPath: nestedResolvedInfo.refPath,
                });
              }
            );
          }
        });
      }
    });
  }

  return results;
}

// Test runner
console.log("🧪 Full Path Resolution Chain Test\n");

// Test 1: Schema traversal
console.log("📋 Test 1: Schema Traversal with Path Resolution");
const results = traverseSchemaWithPaths(testSchema);
console.log(`Found ${results.length} fields`);

// Test 2: Verify all expected fields
console.log("\n📋 Test 2: Expected Fields Verification");
const foundPaths = results.map((r) => r.fieldPath);
const missingFields = expectedFields.filter(
  (path) => !foundPaths.includes(path)
);
const extraFields = foundPaths.filter((path) => !expectedFields.includes(path));

if (missingFields.length === 0 && extraFields.length === 0) {
  console.log("✅ All expected fields found");
} else {
  if (missingFields.length > 0) {
    console.log("❌ Missing fields:", missingFields);
  }
  if (extraFields.length > 0) {
    console.log("❌ Extra fields:", extraFields);
  }
}

// Test 3: $ref field resolution
console.log("\n📋 Test 3: $ref Field Resolution");
const refFields = results.filter((r) => r.isRefField);
console.log(`Found ${refFields.length} $ref fields`);

const personRefFields = refFields.filter((r) => r.refPath === "#/$defs/Person");
console.log(`Found ${personRefFields.length} Person $ref fields`);

// Test 4: Field name extraction
console.log("\n📋 Test 4: Field Name Extraction");
results.forEach((field) => {
  const extractedName = getFieldName(field.fieldPath);
  const expectedName = field.fieldName;
  const success = extractedName === expectedName;
  console.log(
    `${success ? "✅" : "❌"} "${
      field.fieldPath
    }" → "${extractedName}" (expected: "${expectedName}")`
  );
});

// Test 5: Display name priority
console.log("\n📋 Test 5: Display Name Priority");
const displayTests = [
  { field: "settings.notifications.email", expected: "Email Notifications" },
  { field: "user.name", expected: "Full Name" },
  { field: "settings", expected: "settings" }, // No title, use field name
];

displayTests.forEach((test) => {
  const field = results.find((r) => r.fieldPath === test.field);
  if (field) {
    const displayName = field.title || getFieldName(field.fieldPath);
    const success = displayName === test.expected;
    console.log(
      `${success ? "✅" : "❌"} ${test.field}: "${displayName}" (expected: "${
        test.expected
      }")`
    );
  }
});

console.log("\n🎉 Full path resolution test completed!");
