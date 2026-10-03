/**
 * Board Data Model Schema Definition
 * Represents project boards containing workflow lists (Kanban/Scrum views).
 */

const BoardSchemaDefinition = {
  _id: "ObjectId",
  workspace: { type: "ObjectId", ref: "Workspace", required: true },
  name: { type: "String", required: true, trim: true },
  key: { type: "String", required: true, uppercase: true }, // e.g. "PULSE", "DES"
  description: { type: "String", default: "" },
  type: { type: "String", enum: ["kanban", "scrum", "table", "roadmap"], default: "kanban" },
  icon: { type: "String", default: "LayoutDashboard" },
  color: { type: "String", default: "#8B5CF6" },
  isFavorite: { type: "Boolean", default: false },
  members: [{ type: "ObjectId", ref: "User" }],
  lists: [{ type: "ObjectId", ref: "List" }],
  createdAt: "Date",
  updatedAt: "Date"
};

module.exports = {
  BoardSchemaDefinition,
  name: "Board"
};
