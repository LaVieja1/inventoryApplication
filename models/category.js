const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: { type: String, required: true, maxLength: 100, minLength: 1 },
    description: { type: String, maxLength: 1000 },
});

// Virtual for brand's URL
CategorySchema.virtual("url").get(function() {
    return `/catalog/category/${this._id}`;
});

module.exports = mongoose.model("Category", CategorySchema);