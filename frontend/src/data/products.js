export const products = [
  { id: 1, name: "Wireless Bluetooth Headphones", category: "Electronics", price: 2499, image: "🎧" },
  { id: 2, name: "Premium Smart Watch", category: "Electronics", price: 3999, image: "⌚" },
  { id: 3, name: "Casual Running Shoes", category: "Fashion", price: 1999, image: "👟" },
  { id: 4, name: "Travel Backpack", category: "Accessories", price: 1499, image: "🎒" },
  { id: 5, name: "Digital Camera", category: "Electronics", price: 15999, image: "📷" },
  { id: 6, name: "Classic Sunglasses", category: "Accessories", price: 999, image: "🕶️" },
];

export const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);