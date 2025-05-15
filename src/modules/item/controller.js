import { v2 as cloudinary } from "cloudinary";
import { MESSEGES } from '../../constants/index.js';
import { UserModel } from "../users/model.js";
import { Post } from "./modal.js";
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
    // if (!title || !postImg) {
    //   return next(
    //     apiError.badRequest(MESSEGES.NOT_ALL_REQUIRED_FIELDS_MESSAGE, 'createPostController'),
    //   )
    // }

    // const cloudImg = await cloudinary.uploader.upload(postImg, {
    //   folder: "postImg",
    // });

    const owner = req.userId;

    const post = await Post.create({
      ...req.body,
      owner,
      title,
    //   image: {
    //     publicId: cloudImg.public_id,
    //     url: cloudImg.secure_url,
    //   },
    });
    user.posts.push(post._id);
    await user.save();

    return res
      .status(201)
      .send({ isSuccess: true, message: MESSEGES.ITEM_ADDED_SUCCESSFULLY, datta: post })
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

export default {
  createItemController,
  getItemController
}