/**
 * Activity Log Schema Definition
 * Tracks audit trail and real-time user actions across Workspaces & Cards.
 */

const ActivitySchemaDefinition = {
  _id: "ObjectId",
  workspace: { type: "ObjectId", ref: "Workspace" },
  board: { type: "ObjectId", ref: "Board" },
  card: { type: "ObjectId", ref: "Card" },
  user: { type: "ObjectId", ref: "User", required: true },
  action: { 
    type: "String", 
    enum: [
      "created_workspace",
      "created_board",
      "created_card",
      "moved_card",
      "updated_priority",
      "assigned_user",
      "added_comment",
      "completed_subtask"
    ],
    required: true
  },
  details: { type: "Object" },
  createdAt: { type: "Date", default: "Date.now" }
};

module.exports = {
  ActivitySchemaDefinition,
  name: "Activity"
};
