import { apiError } from '../utils/index.js';
import { MESSEGES } from '../constants/index.js';

const isAdmin = async (req, res, next) => {
    try {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            return next(apiError.forbidden('Only admin users can access this endpoint'));
        }
    } catch (error) {
        return next(apiError.internal(error.message, 'isAdmin middleware'));
    }
};

export default isAdmin;
