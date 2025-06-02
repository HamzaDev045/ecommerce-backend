import { v2 as cloudinary } from "cloudinary";
import { MESSEGES } from '../../constants/index.js';
import { UserModel } from "../users/model.js";
import { Post } from "./modal.js";
import { Order } from "./orderModel.js";
import { Notification } from "./notificationModel.js";
import { apiError } from "../../utils/apiErrorHandler.js";
import { getUserByConditions } from "../users/services.js";

export const createItemController = async (req, res, next) => {
  try {    const { title, images, brand, lowStockThreshold } = req.body;
    const email = req?.user?.email;
    const user = await getUserByConditions({ email });


    if (user.role === 'user') {
      return res.status(403).json({
        status: false,
        message: 'Only admin users can access this endpoint'
      });
    }    if (!title || !images || !images.length || !brand) {
      return next(
        apiError.badRequest(MESSEGES.NOT_ALL_REQUIRED_FIELDS_MESSAGE, 'createPostController'),
      )
    }

    // Upload multiple images
    const uploadedImages = [];
    for (const image of images) {
      const cloudImg = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
      uploadedImages.push({
        publicId: cloudImg.public_id,
        url: cloudImg.secure_url,
      });
    }

    const owner = req.userId;

    const post = await Post.create({
      ...req.body,
      owner,
      title,
      brand,
      images: uploadedImages,
      lowStockThreshold: lowStockThreshold || 10,
      isLowStock: req.body.quantity <= (lowStockThreshold || 10),
      status: 'pending' // Set initial status as pending
    });user.posts.push(post._id);
    await user.save();

    // Create notification for warehouse admin
    await Notification.create({
      type: 'new_item',
      message: 'New item awaiting approval',
      details: {
        itemTitle: post.title,
        itemId: post._id,
        brand: post.brand,
        category: post.category,
        quantity: post.quantity
      },
      user: user._id,
      item: post._id
    });

    // Emit socket event for warehouse notification
    const io = req.app.get('io');
    io.emit('newProduct', {
      message: 'New product added to inventory',
      product: {
        title: post.title,
        quantity: post.quantity,
        category: post.category,
        addedBy: user.username,
        status: 'pending'
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
    }    const items = await Post.find({ status: 'approved' })
      .populate('owner', 'username email')
      .select('images title quantity owner status');


    //   console.log(items, 'items')

    const formattedItems = await Promise.all(items.map(async item => {
      const itemOwner = await getUserByConditions({ _id: item.owner });
      if (itemOwner.role === 'admin') {
        return {
          images: item.images,
          title: item.title,
          quantity: item.quantity,
          adminName: itemOwner.username,
          status: item.status,
          adminEmail: item.owner.email,

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

export const getAdminProducts = async (req, res, next) => {
  try {
    const adminId = req.userId;
    const products = await Post.find({ owner: adminId })
      .select('title description price quantity images brand category isLowStock lowStockThreshold rating totalRatings');

    return res.status(200).json({
      status: true,
      data: products
    });
  } catch (error) {
    return next(apiError.internal(error.message, 'getAdminProducts'));
  }
};

export const getLowStockProducts = async (req, res, next) => {
  try {
    const adminId = req.userId;
    const products = await Post.find({ 
      owner: adminId,
      $expr: {
        $lte: ["$quantity", "$lowStockThreshold"]
      }
    }).select('title quantity lowStockThreshold brand category');

    return res.status(200).json({
      status: true,
      data: products
    });
  } catch (error) {
    return next(apiError.internal(error.message, 'getLowStockProducts'));
  }
};

export const getAdminDashboardStats = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastWeek = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get orders for products owned by this admin
    const adminId = req.userId;
    const adminProducts = await Post.find({ owner: adminId }).select('_id');
    const productIds = adminProducts.map(p => p._id);

    // Monthly orders and sales
    const monthlyOrders = await Order.find({
      createdAt: { $gte: firstDayOfMonth },
      'items.item': { $in: productIds }
    });

    const monthlySales = monthlyOrders.reduce((acc, order) => {
      const orderTotal = order.items
        .filter(item => productIds.includes(item.item))
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return acc + orderTotal;
    }, 0);

    // Pending orders count
    const pendingOrderCount = await Order.countDocuments({
      status: 'pending',
      'items.item': { $in: productIds }
    });

    // Low stock products
    const lowStockCount = await Post.countDocuments({ 
      owner: adminId,
      isLowStock: true 
    });

    // New reviews in last week
    const productsWithNewReviews = await Post.aggregate([
      { $match: { owner: adminId } },
      { $unwind: '$comments' },
      { 
        $match: { 
          'comments.createdAt': { $gte: lastWeek }
        }
      },
      { $count: 'total' }
    ]);

    return res.status(200).json({
      status: true,
      data: {
        monthlySales,
        monthlyOrderCount: monthlyOrders.length,
        pendingOrders: pendingOrderCount,
        lowStockItems: lowStockCount,
        newReviews: productsWithNewReviews[0]?.total || 0
      }
    });
  } catch (error) {
    return next(apiError.internal(error.message, 'getAdminDashboardStats'));
  }
};

export const getAdminSalesGraph = async (req, res, next) => {
  try {
    const adminId = req.userId;
    const currentDate = new Date();
    const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);

    // Get admin's products
    const adminProducts = await Post.find({ owner: adminId }).select('_id');
    const productIds = adminProducts.map(p => p._id);

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $in: ['confirmed', 'shipped', 'delivered'] }
        }
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.item': { $in: productIds }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format data for graph
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedData = salesData.map(item => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      sales: item.totalSales,
      orders: item.count
    }));

    return res.status(200).json({
      status: true,
      data: formattedData
    });
  } catch (error) {
    return next(apiError.internal(error.message, 'getAdminSalesGraph'));
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastWeek = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Monthly orders and sales
    const monthlyOrders = await Order.find({
      createdAt: { $gte: firstDayOfMonth }
    });

    const monthlySales = monthlyOrders.reduce((acc, order) => acc + order.totalAmount, 0);

    // User counts
    const userCount = await UserModel.countDocuments({ role: 'user' });
    const vendorCount = await UserModel.countDocuments({ role: 'admin' });

    // Pending orders
    const pendingOrderCount = await Order.countDocuments({ status: 'pending' });

    // Low stock products
    const lowStockCount = await Post.countDocuments({ isLowStock: true });

    // New reviews in last week
    const newReviewsCount = await Post.aggregate([
      { $unwind: '$comments' },
      { 
        $match: { 
          'comments.createdAt': { $gte: lastWeek }
        }
      },
      { $count: 'total' }
    ]);

    return res.status(200).json({
      status: true,
      data: {
        monthlySales,
        monthlyOrderCount: monthlyOrders.length,
        activeVendors: vendorCount,
        totalUsers: userCount,
        pendingOrders: pendingOrderCount,
        lowStockItems: lowStockCount,
        newReviews: newReviewsCount[0]?.total || 0
      }
    });
  } catch (error) {
    return next(apiError.internal(error.message, 'getDashboardStats'));
  }
};

export const getSalesGraph = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $in: ['confirmed', 'shipped', 'delivered'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalSales: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format the data for the graph
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedData = salesData.map(item => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      sales: item.totalSales,
      orders: item.count
    }));

    return res.status(200).json({
      status: true,
      data: formattedData
    });
  } catch (error) {
    return next(apiError.internal(error.message, 'getSalesGraph'));
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const adminId = req.userId;
    const {
      page = 1,
      limit = 10,
      sort = 'newest',
      rating,
      startDate,
      endDate,
      productId
    } = req.query;

    // Base query
    let query = { owner: adminId };
    if (productId) {
      query._id = productId;
    }

    // Date range filter for comments
    const dateFilter = {};
    if (startDate) {
      dateFilter['$gte'] = new Date(startDate);
    }
    if (endDate) {
      dateFilter['$lte'] = new Date(endDate);
    }

    // Get products with their reviews
    const products = await Post.find(query)
      .select('title comments rating totalRatings')
      .populate({
        path: 'comments.user',
        select: 'username email'
      });

    // Process and filter reviews
    let formattedReviews = products.map(product => {
      let filteredComments = product.comments;
      
      // Apply date filters if any
      if (Object.keys(dateFilter).length > 0) {
        filteredComments = filteredComments.filter(comment => 
          (!startDate || comment.createdAt >= new Date(startDate)) &&
          (!endDate || comment.createdAt <= new Date(endDate))
        );
      }

      // Apply rating filter if specified
      if (rating) {
        filteredComments = filteredComments.filter(comment => 
          comment.rating === parseInt(rating)
        );
      }

      // Sort comments
      filteredComments.sort((a, b) => {
        switch(sort) {
          case 'oldest':
            return a.createdAt - b.createdAt;
          case 'highest':
            return b.rating - a.rating;
          case 'lowest':
            return a.rating - b.rating;
          case 'newest':
          default:
            return b.createdAt - a.createdAt;
        }
      });

      return {
        productId: product._id,
        productTitle: product.title,
        rating: product.rating,
        totalRatings: product.totalRatings,
        totalFilteredReviews: filteredComments.length,
        reviews: filteredComments.map(comment => ({
          user: comment.user,
          rating: comment.rating,
          comment: comment.comment,
          createdAt: comment.createdAt
        }))
      };
    });

    // Filter out products with no matching reviews
    formattedReviews = formattedReviews.filter(product => 
      product.totalFilteredReviews > 0
    );

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = formattedReviews.length;
    const paginatedReviews = formattedReviews.slice(startIndex, endIndex);

    return res.status(200).json({
      status: true,
      data: {
        reviews: paginatedReviews,
        pagination: {
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / limit),
          hasMore: endIndex < total
        }
      }
    });
  } catch (error) {
    return next(apiError.internal(error.message, 'getProductReviews'));
  }
};

export const approveItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return next(apiError.badRequest('Invalid status value', 'approveItem'));
    }

    const item = await Post.findById(itemId);
    if (!item) {
      return next(apiError.badRequest('Item not found', 'approveItem'));
    }

    if (item.status === status) {
      return next(apiError.badRequest(`Item is already ${status}`, 'approveItem'));
    }

    // Update item status
    item.status = status;
    await item.save();

    // Create notification for item owner
    // await Notification.create({
    //   type: 'approval',
    //   message: `Your item ${item.title} has been ${status}${reason ? ': ' + reason : ''}`,
    //   details: {
    //     itemTitle: item.title,
    //     status,
    //     reason: reason || null,
    //     processedBy: adminId,
    //     processedAt: new Date()
    //   },
    //   user: item.owner,
    //   item: item._id
    // });

    // // Send socket notification
    // const io = req.app.get('io');
    // io.emit('itemApproval', {
    //   itemId: item._id,
    //   status,
    //   title: item.title,
    //   message: `Item ${item.title} has been ${status}`,
    //   reason: reason || null
    // });

    return res.status(200).json({
      status: true,
      message: `Item ${status} successfully`,
      data: {
        ...item.toObject(),
        notificationSent: true
      }
    });
  } catch (error) {
    console.log(error);
    return next(apiError.internal(error.message, 'approveItem'));
  }
};

export const getAllApprovedProducts = async (req, res, next) => {
  try {
    const { category, brand, minPrice, maxPrice, sort = 'newest' } = req.query;

    // Build query
    let query = { status: 'approved' };
    
    // Add filters if provided
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Create sort options
    let sortOptions = {};
    switch (sort) {
      case 'price-low':
        sortOptions.price = 1;
        break;
      case 'price-high':
        sortOptions.price = -1;
        break;
      case 'rating':
        sortOptions.rating = -1;
        break;
      default:
        sortOptions.createdAt = -1; // newest first
    }

    const products = await Post.find(query)
      .sort(sortOptions)
      .populate('owner', 'username')
      .select('-__v');

    return res.status(200).json({
      status: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        total: products.length,
        filters: {
          category: category || 'all',
          brand: brand || 'all',
          priceRange: {
            min: minPrice || 'any',
            max: maxPrice || 'any'
          }
        }
      }
    });

  } catch (error) {
    console.log(error);
    return next(apiError.internal(error.message, 'getAllApprovedProducts'));
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await getUserByConditions({ _id: userId });
    const { page = 1, limit = 10, read, type } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    // If not admin, only show user's notifications
    if (user.role !== 'admin') {
      query.user = userId;
    }

    // Filter by read status if specified
    if (read !== undefined) {
      query.isRead = read === 'true';
    }

    // Filter by notification type if specified
    if (type) {
      query.type = type;
    }

    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('item', 'title images')
      .populate('user', 'username email');

    // Get total count for pagination
    const total = await Notification.countDocuments(query);

    return res.status(200).json({
      status: true,
      data: {
        notifications,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalNotifications: total,
          hasMore: skip + notifications.length < total
        }
      }
    });

  } catch (error) {
    console.log(error);
    return next(apiError.internal(error.message, 'getNotifications'));
  }
};

// Mark notifications as read
export const markNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { notificationIds } = req.body;
    const user = await getUserByConditions({ _id: userId });

    let query = {
      _id: { $in: notificationIds }
    };

    // If not admin, only allow marking own notifications
    if (user.role !== 'admin') {
      query.user = userId;
    }

    const result = await Notification.updateMany(
      query,
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      status: true,
      message: 'Notifications marked as read',
      data: {
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.log(error);
    return next(apiError.internal(error.message, 'markNotificationsAsRead'));
  }
};

export default {
  createItemController,
  getItemController,
  placeOrder,
  addCommentAndRating,
  getItemComments,
  getAllOrders,
  updateOrderStatus,
  getAdminProducts,
  getLowStockProducts,
  getAdminDashboardStats,
  getAdminSalesGraph,
  getDashboardStats,
  getSalesGraph,
  getProductReviews,
  approveItem,
  getAllApprovedProducts,
  getNotifications,
  markNotificationsAsRead
};