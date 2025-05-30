import mongoose from "mongoose";
const postSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    // Avatar Store in Cloudinary:   
   images: [{
      publicId: String,
      url: String,
    }],
    brand: {
      type: String,
      required: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    isLowStock: {
      type: Boolean,
      default: false,
    },

    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
  },
  {
    timestamps: true,
  }

);

export const Post = mongoose.model('post', postSchema);

