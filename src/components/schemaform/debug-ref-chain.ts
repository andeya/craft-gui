import { traverseSchemaForFields } from "../../utils/schema-utils";
import type { AppSchema } from "../../types/schema";

// Simple test with $ref
const simpleRefSchema: AppSchema = {
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
    name: { type: "string" },
    address: { $ref: "#/$defs/Address" },
  },
};

console.log("=== Debug $ref Resolution ===");

console.log("\nTesting simple $ref:");
let fieldCount = 0;
const fields: string[] = [];
traverseSchemaForFields(
  simpleRefSchema,
  (schema, path) => {
    fieldCount++;
    const pathStr = path.join(".");
    fields.push(pathStr);
    console.log(`  Found field at path: ${pathStr}`);
    console.log(`    Schema type: ${schema.type}`);
    console.log(`    Has $ref: ${!!schema.$ref}`);
    console.log(`    Has properties: ${!!schema.properties}`);
    return schema;
  },
  { resolveRefs: true }
);
console.log(`\nTotal fields found: ${fieldCount}`);
console.log(`Fields: ${fields.join(", ")}`);

// Simple circular reference test
const circularTestSchema: AppSchema = {
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

console.log("\nTesting circular reference:");
fieldCount = 0;
const circularFields: string[] = [];
traverseSchemaForFields(
  circularTestSchema,
  (schema, path) => {
    fieldCount++;
    const pathStr = path.join(".");
    circularFields.push(pathStr);
    console.log(`  Found field at path: ${pathStr}`);
    console.log(`    Schema type: ${schema.type}`);
    console.log(`    Has $ref: ${!!schema.$ref}`);
    console.log(`    Has properties: ${!!schema.properties}`);
    return schema;
  },
  { resolveRefs: true }
);
console.log(`\nTotal fields found: ${fieldCount}`);
console.log(`Fields: ${circularFields.join(", ")}`);
