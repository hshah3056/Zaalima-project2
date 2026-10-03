/**
 * Card Data Model Schema Definition
 * Represents individual work items / tickets inside a List.
 */

const CardSchemaDefinition = {
  _id: "ObjectId",
  key: { type: "String", required: true, uppercase: true }, // e.g. "PULSE-101"
  title: { type: "String", required: true, trim: true },
  description: { type: "String", default: "" },
  list: { type: "ObjectId", ref: "List", required: true },
  board: { type: "ObjectId", ref: "Board", required: true },
  workspace: { type: "ObjectId", ref: "Workspace", required: true },
  position: { type: "Number", required: true, default: 0 },
  priority: { 
    type: "String", 
    enum: ["urgent", "high", "medium", "low"], 
    default: "medium" 
  },
  status: {
    type: "String",
    enum: ["backlog", "todo", "in_progress", "in_review", "done"],
    default: "todo"
  },
  assignees: [{ type: "ObjectId", ref: "User" }],
  reporter: { type: "ObjectId", ref: "User" },
  labels: [
    {
      name: { type: "String" },
      color: { type: "String" }
    }
  ],
  dueDate: { type: "Date" },
  storyPoints: { type: "Number", default: 1 },
  subtasks: [
    {
      id: { type: "String" },
      title: { type: "String" },
      completed: { type: "Boolean", default: false }
    }
  ],
  attachments: [
    {
      name: { type: "String" },
      url: { type: "String" },
      type: { type: "String" }
    }
  ],
  comments: [
    {
      id: { type: "String" },
      user: { type: "ObjectId", ref: "User" },
      content: { type: "String" },
      createdAt: { type: "Date", default: "Date.now" }
    }
  ],
  createdAt: "Date",
  updatedAt: "Date"
};

module.exports = {
  CardSchemaDefinition,
  name: "Card"
};
