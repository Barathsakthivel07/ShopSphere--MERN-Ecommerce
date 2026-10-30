
import assert from "node:assert/strict";
import { validateProductInput } from "./validateProductInput.js";

const validProduct = {
  name: "ShopSphere Test Laptop",
  description: "A test product for validation.",
  price: 49999,
  category: "Electronics",
  image: "https://example.com/laptop.jpg",
  stock: 5,
  isFeatured: false,
};

const testCases = [
  {
    name: "Negative price",
    changes: { price: -100 },
    expectedError: "price",
  },
  {
    name: "Price supplied as string",
    changes: { price: "49999" },
    expectedError: "price",
  },
  {
    name: "Unsupported category",
    changes: { category: "Furniture" },
    expectedError: "category",
  },
  {
    name: "Fractional stock",
    changes: { stock: 2.5 },
    expectedError: "stock",
  },
  {
    name: "Negative stock",
    changes: { stock: -1 },
    expectedError: "stock",
  },
  {
    name: "Invalid image URL",
    changes: { image: "not-a-valid-url" },
    expectedError: "image",
  },
  {
    name: "File protocol image",
    changes: { image: "file:///private/image.jpg" },
    expectedError: "image",
  },
  {
    name: "Missing product name",
    changes: { name: "" },
    expectedError: "name",
  },
  {
    name: "Name longer than 150 characters",
    changes: { name: "A".repeat(151) },
    expectedError: "name",
  },
  {
    name: "Empty description",
    changes: { description: "   " },
    expectedError: "description",
  },
  {
    name: "Invalid featured status",
    changes: { isFeatured: "true" },
    expectedError: "isFeatured",
  },
  {
    name: "Unexpected product field",
    changes: { role: "admin" },
    expectedError: "role",
  },
];

let passed = 0;

for (const testCase of testCases) {
  const input = {
    ...validProduct,
    ...testCase.changes,
  };

  const result = validateProductInput(input);

  assert.equal(
    result.valid,
    false,
    `${testCase.name}: invalid input was accepted`
  );

  assert.ok(
    result.errors[testCase.expectedError],
    `${testCase.name}: expected error for ${testCase.expectedError}`
  );

  assert.equal(result.value, null);

  console.log(`PASS: ${testCase.name}`);
  passed++;
}

console.log(`\n${passed}/${testCases.length} tests passed.`);
console.log("No database or API operations performed.");
