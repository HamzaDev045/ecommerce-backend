import { v2 as cloudinary } from "cloudinary";
import { MESSEGES } from '../../constants/index.js';
import { UserModel } from "../users/model.js";
import { Post } from "./modal.js";
import { Order } from "./orderModel.js";
import { apiError } from "../../utils/apiErrorHandler.js";
import { getUserByConditions } from "../users/services.js";

export const createItemController = async (req, res, next) => {
  try {
    const { title, postImg } = req.body;
    const email = req?.user?.email;
      const user = await getUserByConditions({ email });


    if (user.role === 'user') {
      return res.status(403).json({
        status: false,
        message: 'Only admin users can access this endpoint'
      });
    }
    if (!title || !postImg) {
      return next(
        apiError.badRequest(MESSEGES.NOT_ALL_REQUIRED_FIELDS_MESSAGE, 'createPostController'),
      )
    }

    const cloudImg = await cloudinary.uploader.upload(postImg, {
      folder: "postImg",
    });

    const owner = req.userId;

    const post = await Post.create({
      ...req.body,
      owner,
      title,
      image: {
        publicId: cloudImg.public_id,
        url: cloudImg.secure_url,
      },
    });    user.posts.push(post._id);
    await user.save();

    // Emit socket event for warehouse notification
    const io = req.app.get('io');
    io.emit('newProduct', {
      message: 'New product added to inventory',
      product: {
        title: post.title,
        quantity: post.quantity,
        category: post.category,
        addedBy: user.username
      }
    });

    return res
      .status(201)
      .send({ isSuccess: true, message: MESSEGES.ITEM_ADDED_SUCCESSFULLY, data: post })
  } catch (error) {
    console.log(error.message)
    return next(apiError.internal(error?.message, 'createPostController'))
  }
};

export const getItemController = async (req, res) => {
  try {
    const email = req?.user?.email;

    const user = await getUserByConditions({ email });


    if (!user && user.role !== 'admin') {
      return res.status(403).json({
        status: false,
        message: 'Only admin users can access this endpoint'
      });
    }

    const items = await Post.find()
      .populate('owner', 'username email') // Changed from user to owner since that's the field name in schema
      .select('image title quantity owner');


    //   console.log(items, 'items')

    const formattedItems = await Promise.all(items.map(async item => {
      const itemOwner = await getUserByConditions({ _id: item.owner });
      if (itemOwner.role === 'admin') {
        return {
          image: item.image,
          title: item.title,
          quantity: item.quantity,
          adminName: itemOwner.username
        };
      }
      return null;
    }));

    // Filter out null values and only return items from admin users
    const adminItems = formattedItems.filter(item => item !== null);

    return res.status(200).json({
      status: true,
      data: adminItems
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: 'Error fetching items',
      error: error.message
    });
  }
};

export const placeOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;
    const userId = req.userId;

    if (!items || !items.length || !shippingAddress) {
      return next(
        apiError.badRequest('Items and shipping address are required', 'placeOrder')
      );
    }

    let totalAmount = 0;
    const orderItems = [];

    // Validate items and calculate total
    for (const orderItem of items) {
      const item = await Post.findById(orderItem.itemId);
      if (!item) {
        return next(
          apiError.badRequest(`Item with id ${orderItem.itemId} not found`, 'placeOrder')
        );
      }

      if (item.quantity < orderItem.quantity) {
        return next(
          apiError.badRequest(`Insufficient quantity for item ${item.title}`, 'placeOrder')
        );
      }

      const itemTotal = item.price * orderItem.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        item: item._id,
        quantity: orderItem.quantity,
        price: item.price
      });

      // Update item quantity
      item.quantity -= orderItem.quantity;
      await item.save();
    }    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress
    });

    // Get user details for the notification
    const user = await getUserByConditions({ _id: userId });

    // Emit socket event for new order notification to admin
    const io = req.app.get('io');
    io.emit('newOrder', {
      message: 'New order received',
      orderDetails: {
        orderId: order._id,
        customerName: user.username,
        totalAmount: order.totalAmount,
        itemCount: order.items.length,
        orderStatus: order.status
      }
    });

    return res.status(201).json({
      status: true,
      message: 'Order placed successfully',
      data: order
    });

  } catch (error) {
    console.log(error);
    return next(apiError.internal(error.message, 'placeOrder'));
  }
};

export const addCommentAndRating = async (req, res, next) => {
  try {
    const { itemId, rating, comment } = req.body;
    const userId = req.userId;

    if (!itemId || !rating || !comment) {
      return next(
        apiError.badRequest('Item ID, rating and comment are required', 'addCommentAndRating')
      );
    }

    if (rating < 1 || rating > 5) {
      return next(
        apiError.badRequest('Rating must be between 1 and 5', 'addCommentAndRating')
      );
    }

    const item = await Post.findById(itemId);
    if (!item) {
      return next(
        apiError.badRequest('Item not found', 'addCommentAndRating')
      );
    }

    // Check if user has already rated this item
    const existingComment = item.comments.find(c => c.user.toString() === userId.toString());
    if (existingComment) {
      return next(
        apiError.badRequest('You have already rated this item', 'addCommentAndRating')
      );
    }

    // Add new comment
    item.comments.push({
      user: userId,
      rating,
      comment
    });

    // Update item rating
    const totalRating = item.rating * item.totalRatings + rating;
    item.totalRatings += 1;
    item.rating = totalRating / item.totalRatings;

    await item.save();

    return res.status(200).json({
      status: true,
      message: 'Rating and comment added successfully',
      data: {
        rating: item.rating,
        totalRatings: item.totalRatings,
        comments: item.comments
      }
    });

  } catch (error) {
    console.log(error);
    return next(apiError.internal(error.message, 'addCommentAndRating'));
  }
};

export const getItemComments = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const item = await Post.findById(itemId)
      .populate({
        path: 'comments.user',
        select: 'username email'
      });

    if (!item) {
      return next(
        apiError.badRequest('Item not found', 'getItemComments')
      );
    }

    return res.status(200).json({
      status: true,
      data: {
        rating: item.rating,
        totalRatings: item.totalRatings,
        comments: item.comments
      }
    });

  } catch (error) {
    console.log(error);
    return next(apiError.internal(error.message, 'getItemComments'));
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'username email')
      .populate('items.item', 'title price image');

    return res.status(200).json({
      status: true,
      data: orders
    });
  } catch (error) {
    console.log(error);
    return next(apiError.internal(error.message, 'getAllOrders'));
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'shipped', 'delivered'].includes(status)) {
      return next(
        apiError.badRequest('Invalid order status', 'updateOrderStatus')
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return next(
        apiError.badRequest('Order not found', 'updateOrderStatus')
      );
    }

    order.status = status;
    await order.save();

    // Notify the user about order status change via socket
    const io = req.app.get('io');
    io.emit('orderStatusUpdate', {
      orderId: order._id,
      status: order.status,
      message: `Order status updated to ${status}`
    });

    return res.status(200).json({
      status: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.log(error);
    return next(apiError.internal(error.message, 'updateOrderStatus'));
  }
};

export default {
  createItemController,
  getItemController,
  placeOrder,
  addCommentAndRating,
  getItemComments,
  getAllOrders,
  updateOrderStatus
}