interface EmailTemplateData {
  title: string;
  slug: string;
  sender: string;
  subject: string;
  body: string;
  isDefault: boolean;
}

const templates: Array<EmailTemplateData> = [
  {
    title: 'Activate Account',
    slug: 'activate-account',
    sender: 'noreply@truthy.com',
    subject: 'Activate Account',
    isDefault: true,
    body: "<p>Hi {{username}},</p><p>A new account has been created using your email . Click below button to activate your account.</p><p>{{link}}</p><p>If you haven't requested the code please ignore the email.</p><p>Thank you!.</p>"
  },
  {
    title: 'Two Factor Authentication',
    slug: 'two-factor-authentication',
    sender: 'noreply@truthy.com',
    subject: 'Activate Two Factor Authentication',
    isDefault: true,
    body: "<p>Hi {{username}},</p><p>This mail is sent because you requested to enable two factor authentication. To configure authentication via TOTP on multiple devices, during setup, scan the QR code using each device at the same time.</p><p><img src='{{qrcode}}' id='qr-code-otp' alt='QR code OTP'></p><p style='text-align:start'>A time-based one-time password (TOTP) application automatically generates an authentication code that changes after a certain period of time. We recommend using cloud-based TOTP apps such as:</p><ul><li><a href='https://support.1password.com/one-time-passwords/' target='_self'>1Password</a></li><li><a href='https://authy.com/guides/github/' target='_self'>Authy</a></li><li><a href='https://lastpass.com/auth/' target='_self'>LastPass Authenticator</a></li><li><a href='https://www.microsoft.com/en-us/account/authenticator/' target='_self'>Microsoft Authenticator</a></li><li><a href='https://docs.keeper.io/enterprise-guide/storing-two-factor-codes' target='_self'>Keeper</a></li></ul><p>If you haven't requested the code please ignore the email.</p><p>Thank you!.</p>"
  },
  {
    title: 'Reset Password',
    slug: 'reset-password',
    sender: 'noreply@truthy.com',
    subject: 'Reset Password',
    isDefault: true,
    body: "<p>Hi {{username}},</p><p>You have requested to reset a password. Please use following link to complete the action. Please note this link is only valid for the next hour.</p><p>{{link}}</p><p>If you haven't requested the code please ignore the email.</p><p>Thank you!.</p>"
  },
  {
    title: 'New User Set Password',
    slug: 'new-user-set-password',
    sender: 'noreply@truthy.com',
    subject: 'Set Password',
    isDefault: true,
    body: "<p>Hi {{username}},</p><p>A new account has been created using your email. Please use following link to set password for your account. Please note this link is only valid for the next hour.</p><p>{{link}}</p><p>If you haven't requested the code please ignore the email.</p><p>Thank you!.</p>"
  }
];

export = templates;
