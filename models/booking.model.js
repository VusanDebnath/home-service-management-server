import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    date: {
      type: String,
      required: [true, "Date is required"],
    },

    time: {
      type: String,
      required: [true, "Time is required"],
    },

    address: {
      type: String,
      required: [true, "Address is required"],
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },

    price: {
      type: Number,
      required: true,
    },

    note: {
      type: String,
      default: "",
      // Customer চাইলে extra note দিতে পারবে
    },
  },
  {
    timestamps: true,
  },
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
