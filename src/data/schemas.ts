import { DataSchema } from "@/types/query";

export const SCHEMAS: DataSchema[] = [
  {
    name: "users",
    label: "Users",
    fields: [
      { name: "id", label: "ID", type: "number" },
      { name: "name", label: "Name", type: "string" },
      { name: "email", label: "Email", type: "string" },
      { name: "age", label: "Age", type: "number" },
      { name: "country", label: "Country", type: "string" },
      { name: "status", label: "Status", type: "enum", enumValues: ["active", "inactive", "banned"] },
      { name: "purchases", label: "Purchases", type: "number" },
      { name: "createdAt", label: "Created At", type: "date" },
      { name: "verified", label: "Verified", type: "boolean" },
    ],
  },
  {
    name: "products",
    label: "Products",
    fields: [
      { name: "id", label: "ID", type: "number" },
      { name: "name", label: "Name", type: "string" },
      { name: "category", label: "Category", type: "enum", enumValues: ["electronics", "clothing", "food", "books", "other"] },
      { name: "price", label: "Price", type: "number" },
      { name: "stock", label: "Stock", type: "number" },
      { name: "rating", label: "Rating", type: "number" },
      { name: "inStock", label: "In Stock", type: "boolean" },
      { name: "createdAt", label: "Created At", type: "date" },
    ],
  },
  {
    name: "orders",
    label: "Orders",
    fields: [
      { name: "id", label: "ID", type: "number" },
      { name: "userId", label: "User ID", type: "number" },
      { name: "total", label: "Total", type: "number" },
      { name: "status", label: "Status", type: "enum", enumValues: ["pending", "processing", "shipped", "delivered", "cancelled"] },
      { name: "country", label: "Country", type: "string" },
      { name: "createdAt", label: "Created At", type: "date" },
    ],
  },
];
