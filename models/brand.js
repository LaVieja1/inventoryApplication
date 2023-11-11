const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BrandSchema = new Schema({
    name: { type: String, required: true, maxLength: 50, minLength: 1 },
    description: { type: String, maxLength: 1000 },
    year: { type: Number },
});

// Virtual for brand's URL
BrandSchema.virtual("url").get(function() {
    return `/catalog/brand/${this._id}`;
});

module.exports = mongoose.model("Brand", BrandSchema);