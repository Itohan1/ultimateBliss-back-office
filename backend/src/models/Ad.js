import mongoose from "mongoose";

const adSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["text", "image"],
    required: true,
  },
  text: {
    type: String,
    default: null,
  },
  filename: {
    type: String,
    default: null,
  },
  url: {
    type: String,
    default: null,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

adSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
adSchema.set("toJSON", {
  virtuals: true,
});

const Ad = mongoose.model("Ad", adSchema);

export default Ad;
