import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
      // unique: true → একটা booking এ একটাই review
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    comment: {
      type: String,
      required: [true, "Comment is required"],
      minlength: [10, "Comment must be at least 10 characters"],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// ── Post Save Hook ──
// Review save হলে Service এর rating update করো
reviewSchema.post("save", async function () {
  try {
    const Review = this.constructor;
    // এই service এর সব reviews নাও
    const reviews = await Review.find({ serviceId: this.serviceId });

    // Average rating calculate করো
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    // Service model update করো
    const Service = mongoose.model("Service");
    await Service.findByIdAndUpdate(this.serviceId, {
      rating: Math.round(avgRating * 10) / 10,
      // 4.666... → 4.7 (1 decimal)
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error("Rating update error:", error);
  }
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
