const Instrument = require("../models/instrument");
const Category = require("../models/category");
const Brand = require("../models/brand");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const multer = require("multer"); //Upload images

// Set up multer storage and file name
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/images/");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    },
});

// Create multer upload instance
const upload = multer({ storage: storage });

exports.index = asyncHandler(async (req, res, next) => {
  // Get details of instrument,category and brand counts (in parallel)
  const [numInstruments, numCategories, numBrands] = await Promise.all([
    Instrument.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
    Brand.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Instrument Base Inventory",
    instrument_count: numInstruments,
    category_count: numCategories,
    brand_count: numBrands,
    url: req.url,
  });
});

// Display list of all Instruments.
exports.instrument_list = asyncHandler(async (req, res, next) => {
    const allInstruments = await Instrument.find({}).sort("name").exec();
  
    res.render("instrument_list", {
      title: "Instruments List",
      instrument_list: allInstruments,
    });
});

// Get all categories
async function getCategoryById(categoryId) {
    const category = await Category.findById(categoryId).exec();
    return category ? category.name : "All";
}

// Get all brands
async function getBrandById(brandId) {
    const brand = await Brand.findById(brandId).exec();
    return brand ? brand.name : "All";
}

// Display detail page for a specific instrument.
exports.instrument_detail = asyncHandler(async (req, res, next) => {
    const instrument = await Instrument.findById(req.params.id)
      .populate("category")
      .populate("brand")
      .exec();
  
    if (instrument === null) {
      const err = new Error("Instrument not found");
      err.status = 404;
      return next(err);
    }
  
    const categoryName = await getCategoryById(instrument.category);
    const brandName = await getBrandById(instrument.brand);

    res.render("instrument_detail", {
      name: instrument.name,
      instrument: instrument,
      categoryName: categoryName,
      brandName: brandName,
    });
});

// Display instrument create form on GET
exports.instrument_create_get = asyncHandler(async (req, res, next) => {
    let instrument = new Instrument();
  
    const allInstruments = await Instrument.find().exec();
    const allCategories = await Category.find().populate("name").exec();
    const allBrands = await Brand.find().populate("name").exec();

    res.render("instrument_form", {
      title: "Create Instrument",
      instrument: instrument,
      instruments: allInstruments,
      category: allCategories,
      categories: allCategories,
      brand: allBrands,
      brands: allBrands,
    });
});

// Handle instrument create on POST
exports.instrument_create_post = [
    // Handle single file upload with field name "image"
    upload.single("image"),
  
    // Convert the category to an array.
    (req, res, next) => {
      if (!(req.body.category instanceof Array)) {
        if (typeof req.body.category === "undefined") req.body.category = [];
        else req.body.category = new Array(req.body.category);
      }
      next();
    },

    // Convert the category to an array.
    (req, res, next) => {
      if (!(req.body.brand instanceof Array)) {
        if (typeof req.body.brand === "undefined") req.body.brand = [];
        else req.body.brand = new Array(req.body.brand);
      }
      next();
    },
  
    // Validate and sanitize fields
    body("name", "Name must not be empty").trim().isLength({ min: 1 }).escape(),
    body("description", "Description must not be empty")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("category.*").escape(),
    body("brand.*").escape(),
    body("price", "Price must not be 0").trim().isLength({ min: 1 }).escape(),
    body("stock", "Number of stock must not be 0")
      .trim()
      .isLength({ min: 1 })
      .escape(),
  
    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      const instrument = new Instrument({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        brand: req.body.brand,
        price: req.body.price,
        stock: req.body.stock,
        image: req.file ? req.file.filename : null,
      });
  
      if (!errors.isEmpty()) {
        const [allInstruments, allCategories, allBrands] = await Promise.all([
          Instrument.find().exec(),
          Category.find().populate("name").exec(),
          Brand.find().populate("name").exec(),
        ]);
  
        // Mark our selected genres as checked.
        for (const category of allCategories) {
          if (instrument.category.indexOf(category._id) > -1) {
            category.checked = "true";
          }
        }
        
        // Mark our selected brands as checked.
        for (const brand of allBrands) {
          if (instrument.brand.indexOf(brand._id) > -1) {
            brand.checked = "true";
          }
        }
  
        res.render("instrument_form", {
          title: "Create Instrument",
          instrument: allInstruments,
          instruments: allInstruments.at,
          categories: allCategories,
          brands: allBrands,
          errors: errors.array(),
        });
      } else {
        await instrument.save();
        res.redirect(instrument.url);
      }
    }),
];

// Display delete instrument form on GET
exports.instrument_delete_get = asyncHandler(async (req, res, next) => {
    // Get details of all instruments
    const instrument = await Instrument.findById(req.params.id)
      .populate("name")
      .populate("category")
      .populate("brand")
      .exec();
  
    if (instrument === null) {
      res.redirect("/catalog/instruments");
    }
  
    res.render("instrument_delete", {
      title: "Delete Instrument",
      instrument: instrument,
    });
});

// Handle delete instrument on POST
exports.instrument_delete_post = asyncHandler(async (req, res, next) => {
    const instrument = await Instrument.findById(req.params.id).exec();
  
    if (instrument === null) {
      res.redirect("/catalog/instruments");
    } else {
      await Instrument.findByIdAndRemove(req.params.id);
      res.redirect("/catalog/instruments");
    }
});

/*
// Display instrument update from GET
exports.instrument_update_get = asyncHandler(async (req, res, next) => {
    // Get instrument, categories, brands and existing instruments
    const [instrument, allCategories, allBrands, existingInstruments] = await Promise.all([
      Instrument.findById(req.params.id).populate("category").populate("brand").exec(),
      Category.find().exec(),
      Brand.find().exec(),
      Instrument.find().exec(),
    ]);
  
    if (instrument === null) {
      // No results
      const err = new Error("Instrument not found");
      err.status(400);
      return next(err);
    }
  
    // Mark our selected categories as checked.
    for (const category of allCategories) {
        if (category._id.toString() === category._id.toString()) {
          category.selected = "true";
        }
    }

    // Mark our selected brands as checked.
    for (const brand of allBrands) {
        if (brand._id.toString() === brand._id.toString()) {
          brand.selected = "true";
        }
    }
  
    res.render("instrument_form_update", {
      title: "Update Instrument",
      instrument: instrument,
      categories: allCategories,
      brands: allBrands,
      instruments: existingInstruments,
    });
});
*/


// Display instrument update from GET
exports.instrument_update_get = asyncHandler(async (req, res, next) => {
  const instrument = await Instrument.findById(req.params.id).exec();
  const allCategories = await Category.find().exec();
  const allBrands = await Brand.find().exec();
  const allInstruments = await Instrument.find().exec();

  if (instrument === null) {
    const err = new Error("Instrument not found");
    err.status = 404;
    return next(err);
  }

  res.render("instrument_form_update", {
    title: "Update Instrument",
    instrument: instrument,
    categories: allCategories,
    brands: allBrands,
    instruments: allInstruments,
  });
});


// Handle instrument update on POST
exports.instrument_update_post = [
    // Convert the category to an Array
    (req, res, next) => {
      if (!(req.body.category instanceof Array)) {
        if (typeof req.body.category === "undefined") {
          req.body.category = [];
        } else {
          req.body.category = new Array(req.body.category);
        }
      }
      next();
    },

    // Convert the brand to an Array
    (req, res, next) => {
      if (!(req.body.brand instanceof Array)) {
        if (typeof req.body.brand === "undefined") {
          req.body.brand = [];
        } else {
          req.body.brand = new Array(req.body.brand);
        }
      }
      next();
    },
  
    // Validate and sanitize fields
    body("name", "Name must not be empty").trim().isLength({ min: 1 }).escape(),
    body("description", "Description must not be empty")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("category.*").escape(),
    body("brand.*").escape(),
    body("price", "Price must not be 0").trim().isLength({ min: 1 }).escape(),
    body("stock", "Number of strock must not be 0")
      .trim()
      .isLength({ min: 1 })
      .escape(),
  
    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a Instrument object with escaped/trimmed data and old id.
      const instrument = new Instrument({
        name: req.body.name,
        description: req.body.description,
        category:
          typeof req.body.category === "undefined" ? [] : req.body.category,
        brand:
        typeof req.body.brand === "undefined" ? [] : req.body.brand,
        price: req.body.price,
        stock: req.body.stock,
        _id: req.params.id, // This is required, or a new ID will be assigned!
      });
  
      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
  
        console.log(errors);
        // Get all instruments, categories and brands for form
        const [allInstruments, allCategories, allBrands] = await Promise.all([
          Instrument.find().exec(),
          Category.find().exec(),
          Brand.find().exec(),
        ]);
  
        // Mark our selected categories as selected
        for (const category of allCategories) {
          if (allCategories.indexOf(category._id) > -1) {
            category.selected = "true";
          }
        }

        // Mark our selected brand as selected
        for (const brand of allBrands) {
          if (allBrands.indexOf(brand._id) > -1) {
            brand.selected = "true";
          }
        }
  
        res.render("instrument_form_update", {
          title: "Update Instrument",
          instruments: allInstruments,
          categories: allCategories,
          brands: allBrands,
          instrument: instrument,
          errors: errors.array(),
        });
        return;
      } else {
        // Data from form is valid. Update the record.
        const theinstrument = await Instrument.findByIdAndUpdate(
          req.params.id,
          instrument,
          {}
        );
        console.log("Updated instrument:", theinstrument);
        // Redirect to instrument detail page.
        res.redirect(theinstrument.url);
      }
    }),
];