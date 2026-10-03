/**
 * Workspace Data Model Schema Definition
 * High-level organizational container for boards, teams, and projects.
 */

const WorkspaceSchemaDefinition = {
  _id: "ObjectId",
  name: { type: "String", required: true, trim: true },
  slug: { type: "String", required: true, unique: true, lowercase: true },
  description: { type: "String", default: "" },
  icon: { type: "String", default: "Briefcase" },
  color: { type: "String", default: "#6366F1" }, // Modern indigo
  owner: { type: "ObjectId", ref: "User", required: true },
  members: [
    {
      user: { type: "ObjectId", ref: "User" },
      role: { type: "String", enum: ["owner", "admin", "member", "guest"], default: "member" },
      joinedAt: { type: "Date", default: "Date.now" }
    }
  ],
  boards: [{ type: "ObjectId", ref: "Board" }],
  settings: {
    visibility: { type: "String", enum: ["private", "team", "public"], default: "team" },
    allowGuestInvites: { type: "Boolean", default: true }
  },
  createdAt: "Date",
  updatedAt: "Date"
};

module.exports = {
  WorkspaceSchemaDefinition,
  name: "Workspace"
};
