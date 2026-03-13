// utils/assignmentTracker.js
import mongoose from "mongoose";

const trackerSchema = new mongoose.Schema({
  _id:          { type: String,  default: "analyst_tracker" },
  currentIndex: { type: Number,  default: 0 },
});

const Tracker = mongoose.model("Tracker", trackerSchema);

export const getNextAnalystIndex = async (totalAnalysts) => {
  if (totalAnalysts === 0) return 0;

  // Step 1: get (or create) the tracker document
  let tracker = await Tracker.findById("analyst_tracker");

  if (!tracker) {
    // First ever run — create it starting at index 0
    tracker = await Tracker.create({ _id: "analyst_tracker", currentIndex: 0 });
  }

  // Step 2: the index to USE right now is the current stored value
  const indexToUse = tracker.currentIndex % totalAnalysts;

  // Step 3: advance index for NEXT call and save
  tracker.currentIndex = (indexToUse + 1) % totalAnalysts;
  await tracker.save();

  return indexToUse;
};
