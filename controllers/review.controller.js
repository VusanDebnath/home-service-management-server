import Review from "../models/review.model.js";
import Booking from "../models/booking.model.js";

// ── Create Review (Customer) ──
export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // Field check
    if (!bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Please provide bookingId, rating and comment.",
      });
    }

    // Booking আছে কিনা check
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // এই booking এর customer কিনা check
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only review your own bookings.",
      });
    }

    // Booking completed কিনা check
    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "You can only review completed bookings.",
      });
    }

    // Already reviewed কিনা check
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this booking.",
      });
    }

    // Review তৈরি করো
    const review = await Review.create({
      bookingId,
      customerId: req.user._id,
      serviceId: booking.serviceId,
      providerId: booking.providerId,
      rating,
      comment,
    });
    // post save hook চলবে → Service rating update হবে

    const populatedReview = await Review.findById(review._id)
      .populate("customerId", "name")
      .populate("serviceId", "title");

    res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      review: populatedReview,
    });
  } catch (error) {
    // Duplicate review error handle
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this booking.",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Get Reviews by Service (Public) ──
export const getServiceReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      serviceId: req.params.serviceId,
    })
      .sort({ createdAt: -1 })
      .populate("customerId", "name");

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Get My Reviews (Customer) ──
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ customerId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("serviceId", "title category image")
      .populate("providerId", "name");

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Get Provider Reviews (Provider) ──
export const getProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ providerId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("customerId", "name")
      .populate("serviceId", "title category");

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Delete Review (Admin) ──
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
