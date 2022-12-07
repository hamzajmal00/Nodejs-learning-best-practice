const express = require("express");
const { getAllTours, createTour, updateTour, getOneTour, deleteTour } = require("../controller/tourController");
const { protect, restrictedTo } = require("../controller/userController");

const router = express.Router();

router.route("/").get(protect , restrictedTo('admin','dev','khan'), getAllTours).post(createTour);
router.route("/:id").get(getOneTour).put(updateTour).delete(deleteTour);

module.exports = router;
