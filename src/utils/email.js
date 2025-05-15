// import client from '@sendgrid/mail'
// import { config } from '../config/index.js';
// import { MESSEGES } from '../constants/index.js';
// import { generateEmailVerificationTemplate, generateForgotEmailTemplate, generateTeamEmailTemplate } from './templates/email.js';
// import { apiError } from '../utils/index.js'
// client.setApiKey(config.sendGridApiKey);

// const templates = {
//     'accountVerification': generateEmailVerificationTemplate,
//     'accountForgotPassword': generateForgotEmailTemplate,
//     'accountTeamEmailVerification': generateTeamEmailTemplate,

// }

// const subjects = {
//     'accountVerification': MESSEGES.VERIFICATION_EMAIL_SUBJECT,
//     'accountForgotPassword': MESSEGES.VERIFICATION_FORGOT_SUBJECT,
//     'accountTeamEmailVerification': MESSEGES.VERIFICATION_TEAM_SUBJECT,

// }

// export const sendVerificationEmail = async (sender, resetToken = "reset key...", templateName, next) => {

//     try {

//         const func = templates[templateName];

//         const subject = subjects[templateName]
//         const message = {
//             personalizations: [
//                 {
//                     to: [
//                         {
//                             email: sender.email,
//                             name: sender.fullName
//                         },
//                     ]
//                 },
//             ],
//             from: {
//                 email: 'info@onu.ai',
//                 name: 'Onu Team'
//             },
//             subject,
//             content: [
//                 {
//                     type: 'text/html',
//                     value: func(resetToken)
//                 }
//             ],
//         };

//         const data = await client.send(message)
//         return data;
//     }
//     catch (err) {
//         console.log(JSON.stringify(err), 'err')

//         throw next(apiError.badRequest(MESSEGES.SEND_EMAIL_FAILED, 'send Email'))
//     }
// }



import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import { MESSEGES } from '../constants/index.js';
import { generateEmailVerificationTemplate, generateForgotEmailTemplate, generateTeamEmailTemplate } from './templates/email.js';
import { apiError } from '../utils/index.js'



// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
        auth: {
        user: 'hamzadev45@gmail.com',
        pass: 'agjo xhyx wfee hovz'
    }
});

const templates = {
    'accountVerification': generateEmailVerificationTemplate,
    'accountForgotPassword': generateForgotEmailTemplate,
    'accountTeamEmailVerification': generateTeamEmailTemplate,
}

const subjects = {
    'accountVerification': MESSEGES.VERIFICATION_EMAIL_SUBJECT,
    'accountForgotPassword': MESSEGES.VERIFICATION_FORGOT_SUBJECT,
    'accountTeamEmailVerification': MESSEGES.VERIFICATION_TEAM_SUBJECT,
}

export const sendVerificationEmail = async (sender, resetToken = "reset key...", templateName, next) => {
    try {
        const func = templates[templateName];
        const subject = subjects[templateName];
        
        const mailOptions = {
            from: {
                name: 'Your Online Shop',
                address: config.emailUser
            },
            to: {
                name: sender.fullName,
                address: sender.email
            },
            subject,
            html: func(resetToken)
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (err) {
        console.log(JSON.stringify(err), 'err');
        throw next(apiError.badRequest(MESSEGES.SEND_EMAIL_FAILED, 'send Email'));
    }
}