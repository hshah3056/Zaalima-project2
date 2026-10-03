/**
 * List Data Model Schema Definition
 * Column containers within a Board (e.g. Backlog, In Progress, Code Review, Done).
 */

const ListSchemaDefinition = {
  _id: "ObjectId",
  board: { type: "ObjectId", ref: "Board", required: true },
  title: { type: "String", required: true, trim: true },
  position: { type: "Number", required: true },
  color: { type: "String", default: "#3B82F6" },
  wipLimit: { type: "Number", default: 0 }, // 0 means unlimited
  cards: [{ type: "ObjectId", ref: "Card" }],
  createdAt: "Date",
  updatedAt: "Date"
};

module.exports = {
  ListSchemaDefinition,
  name: "List"
};
