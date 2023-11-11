const express = require("express");
const router = express.Router();

const instrument_controller = require("../controllers/instrumentController");
const brand_controller = require("../controllers/brandController");
const category_controller = require("../controllers/categoryController");

// ABOUT PAGE ROUTE //
router.get("/about", (req, res) => {
    res.render("about");
});

// INSTRUMENTS ROUTES //

// Get catalog home page
router.get("/", instrument_controller.index);

// GET request for creating a instrument.
router.get("/instrument/create", instrument_controller.instrument_create_get);

// POST request for creating instrument
router.post("/instrument/create", instrument_controller.instrument_create_post);

// GET request to delete instrument
router.get("/instrument/:id/delete", instrument_controller.instrument_delete_get);

// POST request to delete instrument
router.post("/instrument/:id/delete", instrument_controller.instrument_delete_post);

// GET request to update instrument
router.get("/instrument/:id/update", instrument_controller.instrument_update_get);

// POST request to update instrument
router.post("/instrument/:id/update", instrument_controller.instrument_update_post);

// GET request for one instrument
router.get("/instrument/:id", instrument_controller.instrument_detail);

// GET request for list of all instruments
router.get("/instruments", instrument_controller.instrument_list);

/// CATEGORY ROUTES ///

// Get request for creating a category.
router.get("/category/create", category_controller.category_create_get);

// POST request for creating category
router.post("/category/create", category_controller.category_create_post);

// GET request to delete category
router.get("/category/:id/delete", category_controller.category_delete_get);

// POST request to delete category
router.post("/category/:id/delete", category_controller.category_delete_post);

// GET request to update category
router.get("/category/:id/update", category_controller.category_update_get);

// POST request to update category
router.post("/category/:id/update", category_controller.category_update_post);

// GET request for one category
router.get("/category/:id", category_controller.category_detail);

// GET request for list of all categories
router.get("/categories", category_controller.category_list);

/// BRAND ROUTES ///

// GET request for creating a brand.
router.get("/brand/create", brand_controller.brand_create_get);

// POST request for creating brand
router.post("/brand/create", brand_controller.brand_create_post);

// GET request to delete brand
router.get("/brand/:id/delete", brand_controller.brand_delete_get);

// POST request to delete brand
router.post("/brand/:id/delete", brand_controller.brand_delete_post);

// GET request to update brand
router.get("/brand/:id/update", brand_controller.brand_update_get);

// POST request to update brand
router.post("/brand/:id/update", brand_controller.brand_update_post);

// GET request for one brand
router.get("/brand/:id", brand_controller.brand_detail);

// GET request for list of all brands
router.get("/brands", brand_controller.brand_list);

module.exports = router;