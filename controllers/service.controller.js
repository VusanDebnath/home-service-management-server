import Service from "../models/service.model.js";

// ── Get All Approved Services (Public) ──
export const getAllServices = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    // req.query → URL এর ? এর পরের অংশ
    // /api/services?category=Plumbing&sort=price_asc

    // Filter object তৈরি
    const filter = { isApproved: true, isAvailable: true };
    // শুধু approved আর available services দেখাবে

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
      // $regex → partial match (contains)
      // $options: 'i' → case insensitive
      // "plumb" → "Plumbing" match করবে
    }

    // Sort option
    let sortOption = { createdAt: -1 }; // default: নতুন আগে
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "rating") sortOption = { rating: -1 };

    const services = await Service.find(filter)
      .sort(sortOption)
      .populate("providerId", "name email phone");
    // populate → providerId এর জায়গায়
    //            Provider এর name, email, phone নিয়ে আসবে

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Get Single Service (Public) ──
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      "providerId",
      "name email phone",
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Create Service (Provider) ──
export const createService = async (req, res) => {
  try {
    const { title, description, category, price, image, duration, location } =
      req.body;

    const service = await Service.create({
      title,
      description,
      category,
      price,
      image,
      duration,
      location,
      providerId: req.user._id,
      // Provider এর id automatically set হবে
      // Frontend থেকে পাঠাতে হবে না
      isApproved: false,
      // নতুন service সবসময় pending
    });

    res.status(201).json({
      success: true,
      message: "Service created! Waiting for admin approval.",
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Get My Services (Provider) ──
export const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ providerId: req.user._id }).sort({
      createdAt: -1,
    });
    // শুধু এই provider এর services

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Update Service (Provider) ──
export const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    // এই service টা এই provider এর কিনা check
    if (service.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own services.",
      });
    }

    const { title, description, category, price, image, duration, location } =
      req.body;

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        price,
        image,
        duration,
        location,
        isApproved: false,
        // Update করলে আবার Admin approval লাগবে
      },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Service updated! Waiting for admin approval.",
      service: updatedService,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Toggle Availability (Provider) ──
export const toggleAvailability = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    // নিজের service কিনা check
    if (service.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized.",
      });
    }

    service.isAvailable = !service.isAvailable;
    await service.save();

    res.status(200).json({
      success: true,
      message: `Service ${service.isAvailable ? "activated" : "deactivated"}!`,
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Delete Service (Provider/Admin) ──
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    // Admin সব delete করতে পারবে
    // Provider শুধু নিজেরটা delete করতে পারবে
    if (
      req.user.role !== "admin" &&
      service.providerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this service.",
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Service deleted successfully!",
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

// ── Get All Services (Admin) ──
export const getAllServicesAdmin = async (req, res) => {
  try {
    const services = await Service.find()
      .sort({ createdAt: -1 })
      .populate("providerId", "name email");
    // Admin সব services দেখবে
    // approved/unapproved সব

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── Approve Service (Admin) ──
export const approveService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    if (service.isApproved) {
      return res.status(400).json({
        success: false,
        message: "Service is already approved.",
      });
    }

    service.isApproved = true;
    await service.save();

    res.status(200).json({
      success: true,
      message: "Service approved successfully!",
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
