
export default function buildProductPayload(form) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    price: Number(form.price),
    category: form.category,
    image: form.image.trim(),
    stock: Number(form.stock),
    isFeatured: form.isFeatured,
  };
}
