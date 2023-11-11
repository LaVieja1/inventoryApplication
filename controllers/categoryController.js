const Instrument = require("../models/instrument");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

// Display list of all categories
exports.category_list = asyncHandler(async (req, res, next) => {
    const allCategories = await Category.find({}).sort({ name: 1 }).exec();
  
    res.render("category_list", {
      title: "Category List",
      category_list: allCategories,
    });
});

// Display detail page for a specific category
exports.category_detail = asyncHandler(async (req, res, next) => {
    // Get details of all categories and all the associated instruments
    const [category, instrumentsInCategory] = await Promise.all([
      Category.findById(req.params.id).exec(),
      Instrument.find({ category: req.params.id }, "name, description").exec(),
    ]);
  
    if (category === null) {
      const err = new Error("Category not found");
      err.status = 404;
      return next(err);
    }
  
    res.render("category_detail", {
      title: "Category Detail",
      category: category,
      category_instruments: instrumentsInCategory,
    });
});

// Display Category create from on GET
exports.category_create_get = (req, res, next) => {
    res.render("category_form", {
      title: "Create Category",
    });
};

// Handle Category create on POST
exports.category_create_post = [
    // Validate and sanitize the name field.
    body("name", "Category name must contain at least 3 characters")
      .trim()
      .isLength({ min: 3 })
      .escape(),
    body("description", "Desciption must contain at least 3 characters")
      .isLength({ min: 3 })
      .escape(),
  
    // Process request after validation and sanitization
    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a category object with escaped and trimmed data.
      const category = new Category({
        name: req.body.name,
        description: req.body.description,
      });
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render("category_form", {
          title: "Create Category",
          category: category,
          errors: errors.array(),
        });
        return;
      } else {
        // Data from form is valid.
        // Check if Category with same name already exists.
        const categoryExists = await Category.findOne({
          name: req.body.name,
        }).exec();
  
        if (categoryExists) {
          // Category exists, redirect to its detail page.
          res.redirect(categoryExists.url);
        } else {
          await category.save();
          // New category saved. Redirect to category detail page.
          res.redirect(category.url);
        }
      }
    }),
];

// Display category delete form on GET
exports.category_delete_get = asyncHandler(async (req, res, next) => {
    // Get details of category and all their instruments (in parallel)
    const [category, instrumentsInCategory] = await Promise.all([
      Category.findById(req.params.id).exec(),
      Instrument.find({ category: req.params.id }, "name, description").exec(),
    ]);
  
    if (category === null) {
      // No results
      req.redirect("/catalog/categories");
    }
  
    res.render("category_delete", {
      title: "Delete Category",
      category: category,
      category_instruments: instrumentsInCategory,
    });
});

// Handle Category delete on POST
exports.category_delete_post = asyncHandler(async (req, res, next) => {
    // Get details of category and all their products (in parallel)
    const [category, instrumentsInCategory] = await Promise.all([
      Category.findById(req.params.id).exec(),
      Instrument.find({ category: req.params.id }).exec(),
    ]);
  
    if (instrumentsInCategory.length > 0) {
      res.render("category_delete", {
        title: "Delete Category",
        category: category,
        category_instruments: instrumentsInCategory,
      });
      return;
    } else {
      // Category has no instruments. Delete object and redirect to the list of categories.
      await Category.findByIdAndRemove(req.body.id);
      res.redirect("/catalog/categories");
    }
});

// Display Category update form on GET
exports.category_update_get = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id).exec();
  
    if (category === null) {
      const err = new Error("Category not found");
      err.status = 404;
      return next(err);
    }
  
    res.render("category_form", {
      title: "Update Category",
      category: category,
    });
});

// Handle Category update on POST
exports.category_update_post = [
    // Validate and sanitize the name field.
    body("name", "Category name must contain at least 3 characters")
      .trim()
      .isLength({ min: 3 })
      .escape(),
    body("description", "Desciption must contain at least 3 characters")
      .isLength({ min: 3 })
      .escape(),
  
    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request .
      const errors = validationResult(req);
  
      // Create a category object with escaped and trimmed data (and the old id!)
      const category = new Category({
        name: req.body.name,
        description: req.body.description,
        _id: req.params.id,
      });
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values and error messages.
        res.render("category_form", {
          title: "Update Category",
          category: category,
          errors: errors.array(),
        });
        return;
      } else {
        // Data from form is valid. Update the record.
        await Category.findByIdAndUpdate(req.params.id, category);
        res.redirect(category.url);
      }
    }),
];