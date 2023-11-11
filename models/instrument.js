const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const InstrumentSchema = new Schema({
    name: { type: String, required: true, maxLength: 100, minLength: 5 },
    description: { type: String, maxLength: 1000 },
    brand: { type: Schema.Types.ObjectId, ref: "Brand" },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    price: Number,
    stock: Number,
    image: { type: String },
});

// Virtual for intrument`s URL
InstrumentSchema.virtual("url").get(function () {
    return `/catalog/instrument/${this._id}`;
});
  
// Populate name and description fields when querying intruments
InstrumentSchema.pre("find", function (next) {
    this.populate("name").populate("description");
    next();
});

module.exports = mongoose.model("Intrument", InstrumentSchema);