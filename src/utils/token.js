import jwt from 'jsonwebtoken';
import { config } from '../config/index.js'


async function generateToken(payload) {
    const token = jwt.sign(payload, config.secrets.jwtSecretKey, { expiresIn: config.secrets.jwtTokenExp });
    return token;
}

async function generateRefreshToken(payload) {
    const token = jwt.sign(payload, config.secrets.jwtSecretKey, { expiresIn: config.secrets.jwtRefreshExp });
    return token;
}

async function generateEmailVerificationToken(payload) {
    const token = jwt.sign(payload, config.secrets.jwtSecretKey, { expiresIn: '5m' });
    return token;
}
async function verifyJwtToken(payload) {
    return jwt.verify(payload, config.secrets.jwtSecretKey);;
}

export { generateToken, generateRefreshToken, generateEmailVerificationToken, verifyJwtToken };
