import { config } from "../../config/index.js";

export const generateEmailVerificationTemplate = (token) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <center>
        <table border="0" cellspacing="0" cellpadding="0" align="center" width="100%" style="max-width:768px;margin-right:auto;margin-left:auto;width:100%!important;font-family:-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Helvetica,Arial,sans-serif,&quot;Apple Color Emoji&quot;,&quot;Segoe UI Emoji&quot;!important">
            <tbody>
                <tr>
                    <td align="center" style="padding:16px">
                        <img src="https://onu.ai/wp-content/uploads/2024/03/onu-logo-blue-300-min.png" alt="OnuTeam" width="100" style="border-style:none" class="CToWUd" data-bit="iit">
                        <h2 style="margin-top:8px!important;margin-bottom:0;font-size:24px;font-weight:400!important;line-height:1.25!important;">Verify your account</h2>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding:0;">
                        <table border="0" cellspacing="0" cellpadding="0" width="70%" style=" border:1px solid #e2e4e8; color : #242930 ">
                            <tbody>
                                <tr>
                                    <td style="padding:24px">
                                        <h3 style="    text-align: center;
                                        font-size:20px;font-weight:600;line-height:1.25!important; color :#24292f !important">Onu account verification</h3>
                                        <p style="margin-top:0;margin-bottom:10px">We've noticed that you need to verify your Onu account. No worries, we've got you covered!</p>
                                        <p style="margin-top:0;margin-bottom:10px">Simply click the button below to verify your account:</p>
                                        <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin-bottom: 33px; margin-top:20px;">
                                            <tbody>
                                                <tr>
                                                    <td align="center">
                                                        <a href="${config.frontEndUrl}auth/verify-email?token=${token}" style="background-color:#07131C;color:#fff;text-decoration:none !important;display:inline-block;font-size:inherit;font-weight:500;line-height:1.5;white-space:nowrap;vertical-align:middle;border-radius:.5em;padding:.75em 1.5em;" target="_blank">Verify your account</a>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <p style="margin-top:0;margin-bottom:10px">If you don’t verify your account within 3 hours, the link will expire. You can request a new verification link by visiting: <a style=" color:#723BFF !important" href="${config.frontEndUrl}auth/verify-email-resend" target="_blank">${config.frontEndUrl}verify-email</a></p>
                                        <p style="margin-top:0;margin-bottom:10px">Thanks,<br>The Onu Team</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
        <table border="0" cellspacing="0" cellpadding="0" align="center" width="100%" style="text-align:center!important">
            <tbody>
                <tr>
                    <td style="padding:16px">
                        <p style="margin-top:0;margin-bottom:10px;color:#6a737d!important;font-size:14px!important;">You're receiving this email because a verification for your Onu account was requested.</p>
                    </td>
                </tr>
            </tbody>
        </table>
    </center>
</body>
</html>`;
}

export const generateForgotEmailTemplate = (token) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <center>
        <table border="0" cellspacing="0" cellpadding="0" align="center" width="100%" style="max-width:768px;margin-right:auto;margin-left:auto;width:100%!important;font-family:-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Helvetica,Arial,sans-serif,&quot;Apple Color Emoji&quot;,&quot;Segoe UI Emoji&quot;!important">
            <tbody>
                <tr>
                    <td align="center" style="padding:16px">
                        <img src="https://onu.ai/wp-content/uploads/2024/03/onu-logo-blue-300-min.png" alt="OnuTeam" width="100" style="border-style:none" class="CToWUd" data-bit="iit">
                        <h2 style="margin-top:8px!important;margin-bottom:0;font-size:24px;font-weight:400!important;line-height:1.25!important;">Reset your password</h2>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding:0;">
                        <table border="0" cellspacing="0" cellpadding="0" width="70%" style=" border:1px solid #e2e4e8; color : #242930 ">
                            <tbody>
                                <tr>
                                    <td style="padding:24px">
                                        <h3 style="    text-align: center;
                                        font-size:20px;font-weight:600;line-height:1.25!important; color :#24292f !important">Onu password reset</h3>
                                        <p style="margin-top:0;margin-bottom:10px">We've noticed that you need to reset your Onu account password. No worries, we've got you covered!</p>
                                        <p style="margin-top:0;margin-bottom:10px">Simply click the button below to reset your password</p>
                                        <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin-bottom: 33px; margin-top:20px;">
                                            <tbody>
                                                <tr>
                                                    <td align="center">
                                                        <a href="${config.frontEndUrl}auth/reset-password?token=${token}" style="background-color:#07131C;color:#fff;text-decoration:none !important;display:inline-block;font-size:inherit;font-weight:500;line-height:1.5;white-space:nowrap;vertical-align:middle;border-radius:.5em;padding:.75em 1.5em;" target="_blank">Reset your password</a>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <p style="margin-top:0;margin-bottom:10px">If you don’t forgot your password within 3 hours, the link will expire. You can request a new reset link by visiting: <a style=" color:#723BFF !important" href="${config.frontEndUrl}auth/password-reset-resend-email" target="_blank">${config.frontEndUrl}auth/password-reset-resend-email</a></p>
                                        <p style="margin-top:0;margin-bottom:10px">Thanks,<br>The Onu Team</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
        <table border="0" cellspacing="0" cellpadding="0" align="center" width="100%" style="text-align:center!important">
            <tbody>
                <tr>
                    <td style="padding:16px">
                        <p style="margin-top:0;margin-bottom:10px;color:#6a737d!important;font-size:14px!important;">You're receiving this email because a verification for your Onu account was requested.</p>
                    </td>
                </tr>
            </tbody>
        </table>
    </center>
</body>
</html>`;
}

export const generateTeamEmailTemplate = (token) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <center>
        <table border="0" cellspacing="0" cellpadding="0" align="center" width="100%" style="max-width:768px;margin-right:auto;margin-left:auto;width:100%!important;font-family:-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Helvetica,Arial,sans-serif,&quot;Apple Color Emoji&quot;,&quot;Segoe UI Emoji&quot;!important">
            <tbody>
                <tr>
                    <td align="center" style="padding:16px">
                        <img src="https://onu.ai/wp-content/uploads/2024/03/onu-logo-blue-300-min.png" alt="OnuTeam" width="100" style="border-style:none" class="CToWUd" data-bit="iit">
                        <h2 style="margin-top:8px!important;margin-bottom:0;font-size:24px;font-weight:400!important;line-height:1.25!important;">Accept your invitaiton!</h2>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding:0;">
                        <table border="0" cellspacing="0" cellpadding="0" width="70%" style=" border:1px solid #e2e4e8; color : #242930 ">
                            <tbody>
                                <tr>
                                    <td style="padding:24px">
                                        <h3 style="    text-align: center;
                                        font-size:20px;font-weight:600;line-height:1.25!important; color :#24292f !important">Onu account invitaion</h3>
                                        <p style="margin-top:0;margin-bottom:10px">You're just a step away from exploring all the amazing features Onu has to offer.</p>
                                        <p style="margin-top:0;margin-bottom:10px">Simply click the button below to accept your invitation:</p>
                                        <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin-bottom: 33px; margin-top:20px;">
                                            <tbody>
                                                <tr>
                                                    <td align="center">
                                                        <a href="${config.frontEndUrl}auth/verify-email?token=${token}&type=team" style="background-color:#07131C;color:#fff;text-decoration:none !important;display:inline-block;font-size:inherit;font-weight:500;line-height:1.5;white-space:nowrap;vertical-align:middle;border-radius:.5em;padding:.75em 1.5em;" target="_blank">Accept Invitation</a>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <p style="margin-top:0;margin-bottom:10px">If you fail to verify your account within 3 hours, the link will expire. Please reach out to your company administrator for assistance. </p>
                                        <p style="margin-top:0;margin-bottom:10px">Thanks,<br>The Onu Team</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
        <table border="0" cellspacing="0" cellpadding="0" align="center" width="100%" style="text-align:center!important">
            <tbody>
                <tr>
                    <td style="padding:16px">
                        <p style="margin-top:0;margin-bottom:10px;color:#6a737d!important;font-size:14px!important;">You're receiving this email because an invitation to join Onu has been sent to you.</p>
                    </td>
                </tr>
            </tbody>
        </table>
    </center>
</body>
</html>`;
}