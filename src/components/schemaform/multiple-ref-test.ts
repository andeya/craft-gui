import { traverseSchemaForFields } from "../../utils/schema-utils";
import type { AppSchema } from "../../types/schema";

// Test schema with multiple fields referencing the same $def (not circular)
const multipleRefSchema: AppSchema = {
  type: "object",
  properties: {
    features: {
      description: "Feature flags and limitations",
      $ref: "#/$defs/FeaturesConfig",
    },
    kdocsapi: {
      description: "Kdocs API configuration",
      $ref: "#/$defs/KDocsApiConfig",
    },
    logging: {
      description: "Logging system configuration",
      $ref: "#/$defs/LoggingConfig",
    },
  },
  $defs: {
    FeaturesConfig: {
      title: "Feature Configuration",
      type: "object",
      properties: {
        dark_mode: {
          title: "Dark Mode Enabled",
          type: "boolean",
          examples: [false],
        },
        max_concurrent: {
          title: "Max Concurrent Operations",
          type: "integer",
          examples: [8],
        },
      },
    },
    KDocsApiConfig: {
      title: "Kdocs API Configuration",
      type: "object",
      properties: {
        cookie: {
          title: "Kdocs Cookie",
          type: "string",
        },
      },
    },
    LogLevel: {
      type: "string",
      enum: ["Trace", "Debug", "Info", "Warn", "Error"],
    },
    LoggingConfig: {
      title: "Logging Configuration",
      type: "object",
      properties: {
        file_logging: {
          title: "File Logging Enabled",
          type: "boolean",
          examples: [true],
        },
        level: {
          title: "Log Level",
          $ref: "#/$defs/LogLevel",
          examples: ["Info"],
        },
      },
    },
  },
};

console.log("🧪 Multiple $ref References Test\n");

// Test: Multiple fields referencing the same $def
console.log("📋 Test: Multiple Fields Referencing Same $def");
let fieldCount = 0;
const foundFields: string[] = [];

traverseSchemaForFields(
  multipleRefSchema,
  (_schema, path) => {
    fieldCount++;
    const fieldPath = path.join(".");
    foundFields.push(fieldPath);
    console.log(`   Found field: ${fieldPath}`);
    return null;
  },
  {
    maxDepth: 10,
    resolveRefs: true,
    includeArrays: true,
    includeObjects: true,
    includePrimitives: true,
  }
);

console.log(`\nTotal fields found: ${fieldCount}`);
console.log(
  "Expected behavior: Should find all fields including sub-fields of $ref objects\n"
);

// Expected fields
const expectedFields = [
  "features",
  "features.dark_mode",
  "features.max_concurrent",
  "kdocsapi",
  "kdocsapi.cookie",
  "logging",
  "logging.file_logging",
  "logging.level",
];

console.log("📋 Field Verification:");
expectedFields.forEach((field) => {
  const found = foundFields.includes(field);
  console.log(`   ${field} ${found ? "✅" : "❌"}`);
});

console.log("\n🎉 Multiple $ref references test completed!");
