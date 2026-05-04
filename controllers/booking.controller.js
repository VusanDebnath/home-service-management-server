import Booking from "../models/booking.model.js";
import Service from "../models/service.model.js";

// ── Create Booking (Customer) ──
export const createBooking = async (req, res) => {
  try {
    const { serviceId, date, time, address, note } = req.body;

    // Field check
    if (!serviceId || !date || !time || !address) {
      return res.status(400).json({
        success: false,
        message: "Please provide serviceId, date, time and address.",
      });
    }

    // Service আছে কিনা check
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    // Service approved কিনা check
    if (!service.isApproved || !service.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "This service is not available.",
      });
    }

    // Provider নিজের service book করতে পারবে না
    if (service.providerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own service.",
      });
    }

    const booking = await Booking.create({
      customerId: req.user._id,
      // Customer automatically set হবে
      providerId: service.providerId,
      // Service থেকে provider automatically নেবো
      serviceId,
      date,
      time,
      address,
      note: note || "",
      price: service.price,
      // Price service থেকে নেবো
      // Frontend থেকে পাঠাতে হবে না
    });

    // populate করে full details দিয়ে return করো
    const populatedBooking = await Booking.findById(booking._id)
      .populate("serviceId", "title category image")
      .populate("providerId", "name email phone")
      .populate("customerId", "name email");

    res.status(201).json({
      success: true,
      message: "Booking created successfully!",
      booking: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Get My Bookings (Customer) ──
export const getMyBookings = async (req, res) => {
  try {
    const { status } = req.query;
    // /api/bookings/my?status=pending → pending bookings

    const filter = { customerId: req.user._id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate("serviceId", "title category image")
      .populate("providerId", "name email phone");

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Get Provider Bookings (Provider) ──
export const getProviderBookings = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { providerId: req.user._id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate("serviceId", "title category image")
      .populate("customerId", "name email phone");

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Get Single Booking ──
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("serviceId", "title category image price")
      .populate("providerId", "name email phone")
      .populate("customerId", "name email phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // শুধু এই booking এর customer, provider, বা admin দেখতে পারবে
    const isCustomer =
      booking.customerId._id.toString() === req.user._id.toString();
    const isProvider =
      booking.providerId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking.",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Cancel Booking (Customer) ──
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // শুধু এই booking এর customer cancel করতে পারবে
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized.",
      });
    }

    // Completed booking cancel করা যাবে না
    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed booking cannot be cancelled.",
      });
    }

    // Already cancelled check
    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled.",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully!",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Confirm Booking (Provider) ──
export const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // শুধু এই booking এর provider confirm করতে পারবে
    if (booking.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized.",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm a ${booking.status} booking.`,
      });
    }

    booking.status = "confirmed";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking confirmed!",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Complete Booking (Provider) ──
export const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized.",
      });
    }

    // শুধু confirmed booking complete করা যাবে
    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: `Cannot complete a ${booking.status} booking.`,
      });
    }

    booking.status = "completed";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking marked as completed!",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ══════════════════════════════
// Admin Only
// ══════════════════════════════

// ── Get All Bookings (Admin) ──
export const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate("serviceId", "title category")
      .populate("customerId", "name email")
      .populate("providerId", "name email");

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
