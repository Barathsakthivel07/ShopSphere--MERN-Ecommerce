import "dotenv/config";

const uri = process.env.MONGO_URI || "";

console.log({
  uriExists: Boolean(uri),
  usesMongoSRV: uri.startsWith("mongodb+srv://"),
  hasUsernamePlaceholder: uri.includes("<db_username>"),
  hasPasswordPlaceholder: uri.includes("<db_password>"),
  hasShopSphereDatabase: uri.includes("/shopsphere"),
  hasAdminAuthSource: uri.includes("authSource=admin"),
});
