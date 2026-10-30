
import assert from "node:assert/strict";
import { validateProductUpdate } from "./validateProductUpdate.js";

const invalidTests = [
  ["Negative price", { price: -100 }, "price"],
  ["String price", { price: "49999" }, "price"],
  ["Infinite price", { price: Infinity }, "price"],
  ["Fractional stock", { stock: 2.5 }, "stock"],
  ["Negative stock", { stock: -1 }, "stock"],
  ["String stock", { stock: "5" }, "stock"],
  ["Invalid category", { category: "Furniture" }, "category"],
  ["Empty name", { name: "   " }, "name"],
  ["Name too long", { name: "A".repeat(151) }, "name"],
  ["Empty description", { description: "" }, "description"],
  ["Invalid image", { image: "not-a-url" }, "image"],
  ["File URL", { image: "file:///image.jpg" }, "image"],
  ["Invalid featured flag", { isFeatured: "true" }, "isFeatured"],
  ["Unknown field", { role: "admin" }, "role"],
  ["MongoDB operator", { $set: { price: 1 } }, "$set"],
  ["Empty update", {}, "body"],
];

let passed = 0;

for (const [name, input, errorField] of invalidTests) {
  const result = validateProductUpdate(input);

  assert.equal(
    result.valid,
    false,
    `${name}: invalid input was accepted`
  );

  assert.ok(
    result.errors[errorField],
    `${name}: expected error for ${errorField}`
  );

  assert.equal(
    result.value,
    null,
    `${name}: invalid input returned update data`
  );

  console.log(`PASS: ${name}`);
  passed++;
}

// Extra verification: valid partial updates should
// include only the requested fields.
const validResult = validateProductUpdate({
  price: 47999,
  stock: 8,
});

assert.equal(validResult.valid, true);
assert.deepEqual(validResult.value, {
  price: 47999,
  stock: 8,
});

console.log("PASS: Valid partial update is sanitized.");
console.log(`\n${passed}/16 invalid-input tests passed.`);
console.log("1/1 valid-input test passed.");
console.log("No API requests or database changes occurred.");
