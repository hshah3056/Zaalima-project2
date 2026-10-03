/**
 * User Data Model Schema Definition
 * Represents users with role-based access, presence, and workspace memberships.
 */

const UserSchemaDefinition = {
  _id: "ObjectId",
  name: { type: "String", required: true, trim: true },
  email: { type: "String", required: true, unique: true, lowercase: true },
  avatar: { type: "String", default: "" },
  role: { 
    type: "String", 
    enum: ["admin", "product_owner", "scrum_master", "developer", "designer"],
    default: "developer"
  },
  status: { 
    type: "String", 
    enum: ["online", "busy", "away", "offline"], 
    default: "offline" 
  },
  preferences: {
    theme: { type: "String", enum: ["dark", "light", "cyberpunk"], default: "dark" },
    notificationsEnabled: { type: "Boolean", default: true }
  },
  createdAt: "Date",
  updatedAt: "Date"
};

// In-Memory Database Store fallback & schema definition export
module.exports = {
  UserSchemaDefinition,
  name: "User"
};
