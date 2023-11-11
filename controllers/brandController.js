const Instrument = require("../models/instrument");
const Brand = require("../models/brand");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

// Display list of all brands
exports.brand_list = asyncHandler(async (req, res, next) => {
  const allBrands = await Brand.find({}).sort({ name: 1 }).exec();

  res.render("brand_list", {
    title: "Brand List",
    brand_list: allBrands,
  });
});

// Display detail page for a specific brands
exports.brand_detail = asyncHandler(async (req, res, next) => {
    // Get details of all brands and all the associated instruments
    const [brand, instrumentsInBrand] = await Promise.all([
      Brand.findById(req.params.id).exec(),
      Instrument.find({ brand: req.params.id }, "name, description").exec(),
    ]);
  
    if (brand === null) {
      const err = new Error("Brand not found");
      err.status = 404;
      return next(err);
    }
  
    res.render("brand_detail", {
      title: "Brand Detail",
      brand: brand,
      brand_instruments: instrumentsInBrand,
    });
});

// Display Brand create from on GET
exports.brand_create_get = (req, res, next) => {
    res.render("brand_form", {
      title: "Create Brand",
    });
};

// Handle Brand create on POST
exports.brand_create_post = [
    // Validate and sanitize the name field.
    body("name", "Brand name must contain at least 3 characters")
      .trim()
      .isLength({ min: 3 })
      .escape(),
    body("description", "Desciption must contain at least 3 characters")
      .isLength({ min: 3 })
      .escape(),
    body("year", "Year nust contain at least 4 numbers")
      .isLength({ min: 4})
      .escape(),

    // Process request after validation and sanitization
    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a brand object with escaped and trimmed data.
      const brand = new Brand({
        name: req.body.name,
        description: req.body.description,
        year: req.body.year,
      });
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render("brand_form", {
          title: "Create Brand",
          brand: brand,
          errors: errors.array(),
        });
        return;
      } else {
        // Data from form is valid.
        // Check if Brand with same name already exists.
        const brandExists = await Brand.findOne({
          name: req.body.name,
        }).exec();
  
        if (brandExists) {
          // Brand exists, redirect to its detail page.
          res.redirect(brandExists.url);
        } else {
          await brand.save();
          // New brand saved. Redirect to brand detail page.
          res.redirect(brand.url);
        }
      }
    }),
];

// Display brand delete form on GET
exports.brand_delete_get = asyncHandler(async (req, res, next) => {
    // Get details of brand and all their instruments (in parallel)
    const [brand, instrumentsInBrand] = await Promise.all([
      Brand.findById(req.params.id).exec(),
      Instrument.find({ brand: req.params.id }, "name, description").exec(),
    ]);
  
    if (brand === null) {
      // No results
      req.redirect("/catalog/brands");
    }
  
    res.render("brand_delete", {
      title: "Delete Brand",
      brand: brand,
      brand_instruments: instrumentsInBrand,
    });
});

// Handle Brand delete on POST
exports.brand_delete_post = asyncHandler(async (req, res, next) => {
    // Get details of brand and all their instruments (in parallel)
    const [brand, instrumentsInBrand] = await Promise.all([
      Brand.findById(req.params.id).exec(),
      Instrument.find({ brand: req.params.id }).exec(),
    ]);
  
    if (instrumentsInBrand.length > 0) {
      res.render("brand_delete", {
        title: "Delete Brand",
        brand: brand,
        brand_instruments: instrumentsInBrand,
      });
      return;
    } else {
      // Brand has no products. Delete object and redirect to the list of brands.
      await Brand.findByIdAndRemove(req.body.id);
      res.redirect("/catalog/brands");
    }
});

// Display Brand update form on GET
exports.brand_update_get = asyncHandler(async (req, res, next) => {
    const brand = await Brand.findById(req.params.id).exec();
  
    if (brand === null) {
      const err = new Error("Brand not found");
      err.status = 404;
      return next(err);
    }
  
    res.render("brand_form", {
      title: "Update Brand",
      brand: brand,
    });
});

// Handle Brand update on POST
exports.brand_update_post = [
    // Validate and sanitize the name field.
    body("name", "Brand name must contain at least 3 characters")
      .trim()
      .isLength({ min: 3 })
      .escape(),
    body("description", "Desciption must contain at least 3 characters")
      .isLength({ min: 3 })
      .escape(),
    body("year", "Year nust contain at least 4 numbers")
      .isLength({ min: 4})
      .escape(),
  
    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request .
      const errors = validationResult(req);
  
      // Create a brand object with escaped and trimmed data (and the old id!)
      const brand = new Brand({
        name: req.body.name,
        description: req.body.description,
        year: req.body.year,
        _id: req.params.id,
      });
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values and error messages.
        res.render("brand_form", {
          title: "Update Brand",
          brand: brand,
          errors: errors.array(),
        });
        return;
      } else {
        // Data from form is valid. Update the record.
        await Brand.findByIdAndUpdate(req.params.id, brand);
        res.redirect(brand.url);
      }
    }),
];