const Tour = require("../model/Tour");

exports.getAllTours = async (req, res, next) => {
  try {
    const tour = await Tour.find();
    res.status(200).json({
      result: tour.length,
      status: "success",
      data: tour,
    });
  } catch (error) {
    res.status(200).json({
      status: "false",
      data: error,
    });
  }
  next();
};
const catchAsync = (fn) => {
  return (req, res, next) => {
    return fn(req, res, next).catch(next);
  };
};
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(200).json({
    status: "success",
    data: newTour,
  });
  // try {
  //   const newTour = await Tour.create(req.body);
  //   res.status(200).json({
  //     status: "success",
  //     data: newTour,
  //   });
  // } catch (error) {
  //   res.status(404).json({
  //     status: "false",
  //     data: error,
  //   });
  // }
  next();
});
exports.updateTour = async (req, res, next) => {
  try {
    const updateTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({
      status: "success",
      data: updateTour,
    });
  } catch (error) {
    res.status(404).json({
      status: "false",
      data: error,
    });
  }
  next();
};
exports.deleteTour = async (req, res, next) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "success",
      data: "Tour delete Successfully !",
    });
  } catch (error) {
    res.status(404).json({
      status: "false",
      data: error,
    });
  }
  next();
};
exports.getOneTour = async (req, res, next) => {
  try {
    const getOneTour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: getOneTour,
    });
  } catch (error) {
    res.status(404).json({
      status: "false",
      data: error,
    });
  }
  next();
};
