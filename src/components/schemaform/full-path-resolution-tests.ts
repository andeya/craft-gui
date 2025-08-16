import { fieldPathResolver } from "./ref-path-resolver";
import { getFieldName } from "./layout-utils";
import { traverseSchemaForFields } from "../../utils/schema-utils";
import type { AppSchema } from "../../types/schema";

// Test schemas
const testSchema = {
  $id: "test-schema",
  type: "object",
  properties: {
    user: {
      $ref: "#/$defs/Person",
    },
    manager: {
      $ref: "#/$defs/Person",
    },
    profile: {
      $ref: "#/$defs/Person",
    },
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
        theme: { type: "string", title: "Theme" },
      },
    },
    simple: { type: "string", title: "Simple Field" },
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

const complexSchema = {
  $id: "complex-schema",
  type: "object",
  properties: {
    company: {
      type: "object",
      properties: {
        employees: {
          type: "array",
          items: {
            $ref: "#/$defs/Employee",
          },
        },
        departments: {
          type: "object",
          properties: {
            engineering: {
              $ref: "#/$defs/Department",
            },
            marketing: {
              $ref: "#/$defs/Department",
            },
          },
        },
      },
    },
  },
  $defs: {
    Employee: {
      type: "object",
      properties: {
        id: { type: "string", title: "Employee ID" },
        details: {
          $ref: "#/$defs/Person",
        },
      },
    },
    Department: {
      type: "object",
      properties: {
        name: { type: "string", title: "Department Name" },
        manager: {
          $ref: "#/$defs/Person",
        },
      },
    },
    Person: {
      type: "object",
      properties: {
        name: { type: "string", title: "Person Name" },
        email: { type: "string", title: "Person Email" },
      },
    },
  },
} as AppSchema;

// Layout configurations for testing
const testLayoutConfig = [
  { fieldPath: undefined, columns: 2 }, // Root level
  { fieldPath: "user", columns: 3, span: 1 }, // User object
  { fieldPath: "manager", columns: 3, span: 1 }, // Manager object
  { fieldPath: "profile", columns: 2, span: 1 }, // Profile object
  { fieldPath: "settings", columns: 2, span: 1 }, // Settings object
  { fieldPath: "settings.notifications", columns: 2, span: 1 }, // Notifications object
  { fieldPath: "company", columns: 2, span: 2 }, // Company object
  { fieldPath: "company.departments", columns: 2, span: 1 }, // Departments object
  { fieldPath: "company.departments.engineering", columns: 2, span: 1 }, // Engineering dept
  { fieldPath: "company.departments.marketing", columns: 2, span: 1 }, // Marketing dept
];

// Expected field traversal results
const expectedTestSchemaFields = [
  // Root level fields
  { path: "user", title: undefined, isRef: true, refPath: "#/$defs/Person" },
  { path: "manager", title: undefined, isRef: true, refPath: "#/$defs/Person" },
  { path: "profile", title: undefined, isRef: true, refPath: "#/$defs/Person" },
  { path: "settings", title: undefined, isRef: false },
  { path: "simple", title: "Simple Field", isRef: false },

  // Settings nested fields
  { path: "settings.notifications", title: undefined, isRef: false },
  { path: "settings.theme", title: "Theme", isRef: false },

  // Notifications nested fields
  {
    path: "settings.notifications.email",
    title: "Email Notifications",
    isRef: false,
  },
  {
    path: "settings.notifications.push",
    title: "Push Notifications",
    isRef: false,
  },

  // Person ref fields (should be resolved for each parent)
  {
    path: "user.name",
    title: "Full Name",
    isRef: true,
    refPath: "#/$defs/Person",
  },
  {
    path: "user.email",
    title: "Email Address",
    isRef: true,
    refPath: "#/$defs/Person",
  },
  { path: "user.age", title: "Age", isRef: true, refPath: "#/$defs/Person" },
  {
    path: "manager.name",
    title: "Full Name",
    isRef: true,
    refPath: "#/$defs/Person",
  },
  {
    path: "manager.email",
    title: "Email Address",
    isRef: true,
    refPath: "#/$defs/Person",
  },
  { path: "manager.age", title: "Age", isRef: true, refPath: "#/$defs/Person" },
  {
    path: "profile.name",
    title: "Full Name",
    isRef: true,
    refPath: "#/$defs/Person",
  },
  {
    path: "profile.email",
    title: "Email Address",
    isRef: true,
    refPath: "#/$defs/Person",
  },
  { path: "profile.age", title: "Age", isRef: true, refPath: "#/$defs/Person" },
];

const expectedComplexSchemaFields = [
  // Root level
  { path: "company", title: undefined, isRef: false },

  // Company nested
  { path: "company.employees", title: undefined, isRef: false },
  { path: "company.departments", title: undefined, isRef: false },

  // Departments nested
  {
    path: "company.departments.engineering",
    title: undefined,
    isRef: true,
    refPath: "#/$defs/Department",
  },
  {
    path: "company.departments.marketing",
    title: undefined,
    isRef: true,
    refPath: "#/$defs/Department",
  },

  // Employee ref fields
  {
    path: "company.employees.id",
    title: "Employee ID",
    isRef: true,
    refPath: "#/$defs/Employee",
  },
  {
    path: "company.employees.details",
    title: undefined,
    isRef: true,
    refPath: "#/$defs/Employee",
  },

  // Employee details (Person ref)
  {
    path: "company.employees.details.name",
    title: "Person Name",
    isRef: true,
    refPath: "#/$defs/Person",
  },
  {
    path: "company.employees.details.email",
    title: "Person Email",
    isRef: true,
    refPath: "#/$defs/Person",
  },

  // Department ref fields
  {
    path: "company.departments.engineering.name",
    title: "Department Name",
    isRef: true,
    refPath: "#/$defs/Department",
  },
  {
    path: "company.departments.engineering.manager",
    title: undefined,
    isRef: true,
    refPath: "#/$defs/Department",
  },
  {
    path: "company.departments.marketing.name",
    title: "Department Name",
    isRef: true,
    refPath: "#/$defs/Department",
  },
  {
    path: "company.departments.marketing.manager",
    title: undefined,
    isRef: true,
    refPath: "#/$defs/Department",
  },

  // Department manager (Person ref)
  {
    path: "company.departments.engineering.manager.name",
    title: "Person Name",
    isRef: true,
    refPath: "#/$defs/Person",
  },
  {
    path: "company.departments.engineering.manager.email",
    title: "Person Email",
    isRef: true,
    refPath: "#/$defs/Person",
  },
  {
    path: "company.departments.marketing.manager.name",
    title: "Person Name",
    isRef: true,
    refPath: "#/$defs/Person",
  },
  {
    path: "company.departments.marketing.manager.email",
    title: "Person Email",
    isRef: true,
    refPath: "#/$defs/Person",
  },
];

// Full schema traversal function
function traverseSchemaWithPathResolution(
  schema: AppSchema,
  rootSchema: AppSchema,
  maxDepth: number = 10
): Array<{
  fieldPath: string;
  fieldName: string;
  parentPath: string;
  title?: string;
  isRefField: boolean;
  refPath?: string;
  layoutConfig?: any;
}> {
  const results: Array<{
    fieldPath: string;
    fieldName: string;
    parentPath: string;
    title?: string;
    isRefField: boolean;
    refPath?: string;
    layoutConfig?: any;
  }> = [];

  traverseSchemaForFields(
    schema,
    (currentSchema, path) => {
      if (path.length === 0) return null;

      const fieldName = path[path.length - 1];
      const parentPath = path.length > 1 ? path.slice(0, -1).join(".") : "";
      // const fieldPath = path.join(".");

      // Resolve field path with $ref context
      const resolvedInfo = fieldPathResolver.resolveFieldPath(
        fieldName,
        parentPath,
        currentSchema,
        rootSchema
      );

      // Find layout configuration
      const layoutConfig = fieldPathResolver.findLayoutConfig(
        resolvedInfo,
        testLayoutConfig
      );

      results.push({
        fieldPath: resolvedInfo.fieldPath,
        fieldName: resolvedInfo.fieldName,
        parentPath: resolvedInfo.parentPath,
        title: currentSchema.title,
        isRefField: resolvedInfo.isRefField,
        refPath: resolvedInfo.refPath,
        layoutConfig,
      });

      return null;
    },
    {
      maxDepth,
      resolveRefs: true,
      includeArrays: true,
      includeObjects: true,
      includePrimitives: true,
    }
  );

  return results;
}

// Test runner
console.log("🧪 Full Path Resolution Chain Test Suite\n");

// Test 1: Basic schema traversal with path resolution
console.log("📋 Test 1: Basic Schema Traversal with Path Resolution");
const testSchemaResults = traverseSchemaWithPathResolution(
  testSchema,
  testSchema
);
console.log(`Found ${testSchemaResults.length} fields in test schema`);

// Verify all expected fields are found
const testSchemaPaths = testSchemaResults.map((r) => r.fieldPath);
const expectedTestPaths = expectedTestSchemaFields.map((e) => e.path);

const missingTestFields = expectedTestPaths.filter(
  (path) => !testSchemaPaths.includes(path)
);
const extraTestFields = testSchemaPaths.filter(
  (path) => !expectedTestPaths.includes(path)
);

if (missingTestFields.length === 0 && extraTestFields.length === 0) {
  console.log("✅ All expected fields found, no extra fields");
} else {
  if (missingTestFields.length > 0) {
    console.log("❌ Missing fields:", missingTestFields);
  }
  if (extraTestFields.length > 0) {
    console.log("❌ Extra fields:", extraTestFields);
  }
}

// Test 2: Complex schema traversal
console.log("\n📋 Test 2: Complex Schema Traversal");
const complexSchemaResults = traverseSchemaWithPathResolution(
  complexSchema,
  complexSchema
);
console.log(`Found ${complexSchemaResults.length} fields in complex schema`);

const complexSchemaPaths = complexSchemaResults.map((r) => r.fieldPath);
const expectedComplexPaths = expectedComplexSchemaFields.map((e) => e.path);

const missingComplexFields = expectedComplexPaths.filter(
  (path) => !complexSchemaPaths.includes(path)
);
const extraComplexFields = complexSchemaPaths.filter(
  (path) => !expectedComplexPaths.includes(path)
);

if (missingComplexFields.length === 0 && extraComplexFields.length === 0) {
  console.log("✅ All expected fields found, no extra fields");
} else {
  if (missingComplexFields.length > 0) {
    console.log("❌ Missing fields:", missingComplexFields);
  }
  if (extraComplexFields.length > 0) {
    console.log("❌ Extra fields:", extraComplexFields);
  }
}

// Test 3: $ref field resolution verification
console.log("\n📋 Test 3: $ref Field Resolution Verification");
const refFields = testSchemaResults.filter((r) => r.isRefField);
console.log(`Found ${refFields.length} $ref fields`);

const personRefFields = refFields.filter((r) => r.refPath === "#/$defs/Person");
console.log(`Found ${personRefFields.length} Person $ref fields`);

// Verify Person ref fields have correct field paths
const expectedPersonFieldPaths = ["user", "manager", "profile"];
const foundPersonFieldPaths = personRefFields.map((r) => r.fieldPath);
const missingPersonFieldPaths = expectedPersonFieldPaths.filter(
  (path) => !foundPersonFieldPaths.includes(path)
);

if (missingPersonFieldPaths.length === 0) {
  console.log("✅ All Person $ref fields correctly resolved");
} else {
  console.log("❌ Missing Person $ref field paths:", missingPersonFieldPaths);
}

// Test 4: Layout configuration matching
console.log("\n📋 Test 4: Layout Configuration Matching");
const fieldsWithLayout = testSchemaResults.filter((r) => r.layoutConfig);
console.log(
  `Found ${fieldsWithLayout.length} fields with layout configuration`
);

// Test specific layout matches
const layoutTests = [
  { field: "user", expectedColumns: 3, expectedSpan: 1 },
  { field: "settings", expectedColumns: 2, expectedSpan: 1 },
  { field: "settings.notifications", expectedColumns: 2, expectedSpan: 1 },
  { field: "simple", expectedColumns: undefined, expectedSpan: undefined }, // No specific config
];

layoutTests.forEach((test) => {
  const field = testSchemaResults.find((r) => r.fieldPath === test.field);
  if (field && field.layoutConfig) {
    const success =
      field.layoutConfig.columns === test.expectedColumns &&
      field.layoutConfig.span === test.expectedSpan;
    console.log(
      `${success ? "✅" : "❌"} ${test.field}: columns=${
        field.layoutConfig.columns
      }, span=${field.layoutConfig.span}`
    );
  } else if (!test.expectedColumns) {
    console.log(`✅ ${test.field}: No layout config (expected)`);
  } else {
    console.log(`❌ ${test.field}: No layout config found`);
  }
});

// Test 5: Field name extraction from paths
console.log("\n📋 Test 5: Field Name Extraction from Paths");
const fieldNameTests = [
  { path: "user.name", expected: "name" },
  { path: "settings.notifications.email", expected: "email" },
  { path: "company.employees.details.name", expected: "name" },
  { path: "simple", expected: "simple" },
];

fieldNameTests.forEach((test) => {
  const extracted = getFieldName(test.path);
  const success = extracted === test.expected;
  console.log(
    `${success ? "✅" : "❌"} "${test.path}" → "${extracted}" (expected: "${
      test.expected
    }")`
  );
});

// Test 6: Display name priority
console.log("\n📋 Test 6: Display Name Priority");
const displayNameTests = [
  { field: "simple", expected: "Simple Field" }, // Has title
  { field: "user.name", expected: "Full Name" }, // Has title from $ref
  { field: "settings.notifications.email", expected: "Email Notifications" }, // Has title
  { field: "settings.theme", expected: "Theme" }, // Has title
];

displayNameTests.forEach((test) => {
  const field = testSchemaResults.find((r) => r.fieldPath === test.field);
  if (field) {
    const displayName = field.title || getFieldName(field.fieldPath);
    const success = displayName === test.expected;
    console.log(
      `${success ? "✅" : "❌"} ${test.field}: "${displayName}" (expected: "${
        test.expected
      }")`
    );
  } else {
    console.log(`❌ ${test.field}: Field not found`);
  }
});

// Test 7: Path uniqueness verification
console.log("\n📋 Test 7: Path Uniqueness Verification");
const allPaths = [...testSchemaResults, ...complexSchemaResults].map(
  (r) => r.fieldPath
);
const uniquePaths = new Set(allPaths);

if (allPaths.length === uniquePaths.size) {
  console.log("✅ All field paths are unique");
} else {
  const duplicates = allPaths.filter(
    (path, index) => allPaths.indexOf(path) !== index
  );
  console.log("❌ Duplicate paths found:", [...new Set(duplicates)]);
}

// Test 8: $ref object field consistency
console.log("\n📋 Test 8: $ref Object Field Consistency");
const personFields = testSchemaResults.filter(
  (r) => r.refPath === "#/$defs/Person"
);
const personFieldNames = personFields.map((r) => r.fieldName);
const uniquePersonFieldNames = new Set(personFieldNames);

console.log(`Person $ref fields: ${personFieldNames.join(", ")}`);
if (uniquePersonFieldNames.size === 3) {
  // name, email, age
  console.log("✅ All Person $ref fields have consistent field names");
} else {
  console.log("❌ Inconsistent Person $ref field names");
}

console.log("\n🎉 Full path resolution chain test completed!");
console.log(`\n📊 Summary:`);
console.log(`- Test Schema: ${testSchemaResults.length} fields`);
console.log(`- Complex Schema: ${complexSchemaResults.length} fields`);
console.log(`- $ref Fields: ${refFields.length} fields`);
console.log(`- Fields with Layout: ${fieldsWithLayout.length} fields`);
