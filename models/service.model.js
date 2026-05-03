import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [20, "Description must be at least 20 characters"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Plumbing",
        "Electrical",
        "Cleaning",
        "AC Repair",
        "Painting",
        "Carpentry",
      ],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1, "Price must be greater than 0"],
    },

    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80",
    },

    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // ref: 'User' → User model এর সাথে connection
      // populate() দিয়ে provider এর details নেওয়া যাবে
    },

    isApproved: {
      type: Boolean,
      default: false,
      // নতুন service → Admin approve করার আগে false
    },

    isAvailable: {
      type: Boolean,
      default: true,
      // Provider চাইলে service বন্ধ করতে পারবে
    },

    duration: {
      type: String,
      default: "1-2 hours",
    },

    location: {
      type: String,
      default: "Dhaka",
    },

    // Rating গুলো Reviews থেকে calculate হবে
    // এখন manually রাখছি, পরে auto update হবে
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;
