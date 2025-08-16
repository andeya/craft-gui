import { traverseSchemaForFields } from "../../utils/schema-utils";
import type { AppSchema } from "../../types/schema";

// Test 1: Simple circular reference
const circularSchema: AppSchema = {
  $defs: {
    Person: {
      type: "object",
      properties: {
        name: { type: "string" },
        friend: { $ref: "#/$defs/Person" }, // Circular reference
      },
    },
  },
  $ref: "#/$defs/Person",
};

// Test 2: Multiple references to the same $def (should be allowed)
const multipleRefSchema: AppSchema = {
  $defs: {
    Address: {
      type: "object",
      properties: {
        street: { type: "string" },
        city: { type: "string" },
      },
    },
  },
  type: "object",
  properties: {
    homeAddress: { $ref: "#/$defs/Address" },
    workAddress: { $ref: "#/$defs/Address" }, // Multiple references to same $def
  },
};

// Test 3: Complex circular reference
const complexCircularSchema: AppSchema = {
  $defs: {
    Node: {
      type: "object",
      properties: {
        id: { type: "string" },
        children: {
          type: "array",
          items: { $ref: "#/$defs/Node" }, // Circular reference in array
        },
      },
    },
  },
  $ref: "#/$defs/Node",
};

// Test 4: Mixed scenario with circular and non-circular references
const mixedSchema: AppSchema = {
  $defs: {
    Person: {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "integer" },
        manager: { $ref: "#/$defs/Person" }, // Circular reference
      },
    },
    Address: {
      type: "object",
      properties: {
        street: { type: "string" },
        city: { type: "string" },
      },
    },
  },
  type: "object",
  properties: {
    employee: { $ref: "#/$defs/Person" },
    homeAddress: { $ref: "#/$defs/Address" },
    workAddress: { $ref: "#/$defs/Address" },
  },
};

// Test 5: Deep traversal test
const deepSchema: AppSchema = {
  $defs: {
    Address: {
      type: "object",
      properties: {
        street: { type: "string" },
        city: { type: "string" },
        country: { type: "string" },
      },
    },
    Contact: {
      type: "object",
      properties: {
        email: { type: "string" },
        phone: { type: "string" },
      },
    },
  },
  type: "object",
  properties: {
    name: { type: "string" },
    address: { $ref: "#/$defs/Address" },
    contact: { $ref: "#/$defs/Contact" },
  },
};

console.log("=== Testing Circular Reference Detection ===");

// Test 1: Should detect circular reference
console.log("\n1. Testing simple circular reference:");
let fieldCount = 0;
const fields1: string[] = [];
traverseSchemaForFields(
  circularSchema,
  (schema, path) => {
    fieldCount++;
    const pathStr = path.join(".");
    fields1.push(pathStr);
    console.log(`  Found field at path: ${pathStr}`);
    return schema;
  },
  { resolveRefs: true }
);
console.log(`  Total fields found: ${fieldCount}`);
console.log(`  Fields: ${fields1.join(", ")}`);

// Test 2: Should allow multiple references
console.log("\n2. Testing multiple references to same $def:");
fieldCount = 0;
const fields2: string[] = [];
traverseSchemaForFields(
  multipleRefSchema,
  (schema, path) => {
    fieldCount++;
    const pathStr = path.join(".");
    fields2.push(pathStr);
    console.log(`  Found field at path: ${pathStr}`);
    return schema;
  },
  { resolveRefs: true }
);
console.log(`  Total fields found: ${fieldCount}`);
console.log(`  Fields: ${fields2.join(", ")}`);

// Test 3: Should detect complex circular reference
console.log("\n3. Testing complex circular reference:");
fieldCount = 0;
const fields3: string[] = [];
traverseSchemaForFields(
  complexCircularSchema,
  (schema, path) => {
    fieldCount++;
    const pathStr = path.join(".");
    fields3.push(pathStr);
    console.log(`  Found field at path: ${pathStr}`);
    return schema;
  },
  { resolveRefs: true }
);
console.log(`  Total fields found: ${fieldCount}`);
console.log(`  Fields: ${fields3.join(", ")}`);

// Test 4: Mixed scenario
console.log("\n4. Testing mixed scenario:");
fieldCount = 0;
const fields4: string[] = [];
traverseSchemaForFields(
  mixedSchema,
  (schema, path) => {
    fieldCount++;
    const pathStr = path.join(".");
    fields4.push(pathStr);
    console.log(`  Found field at path: ${pathStr}`);
    return schema;
  },
  { resolveRefs: true }
);
console.log(`  Total fields found: ${fieldCount}`);
console.log(`  Fields: ${fields4.join(", ")}`);

console.log("\n5. Testing deep traversal:");
fieldCount = 0;
const fields5: string[] = [];
traverseSchemaForFields(
  deepSchema,
  (schema, path) => {
    fieldCount++;
    const pathStr = path.join(".");
    fields5.push(pathStr);
    console.log(`  Found field at path: ${pathStr}`);
    return schema;
  },
  { resolveRefs: true }
);
console.log(`  Total fields found: ${fieldCount}`);
console.log(`  Fields: ${fields5.join(", ")}`);

console.log("\n=== Summary ===");
console.log("Expected behavior:");
console.log(
  "1. Circular references should be detected and traversal should stop at the circular point"
);
console.log(
  "2. Multiple references to the same $def should be allowed and fully traversed"
);
console.log("3. Non-circular references should be fully traversed");
console.log(
  "4. Mixed scenarios should handle both circular and non-circular references correctly"
);
