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
    body: "<p>Hi {{username}},</p><p>A new account has been created using your email . Click below button to activate your account.</p><p>{{link}}</p><p>If you haven't requested the code please ignore the email.</p><p>Thank you!.</p>",
  },
  {
    title: 'Reset Password',
    slug: 'reset-password',
    sender: 'noreply@truthy.com',
    subject: 'Reset Password',
    isDefault: true,
    body: "<p>Hi {{username}},</p><p>You have requested to reset a password. Please use following link to complete the action. Please note this link is only valid for the next hour.</p><p>{{link}}</p><p>If you haven't requested the code please ignore the email.</p><p>Thank you!.</p>",
  },
  {
    title: 'New User Set Password',
    slug: 'new-user-set-password',
    sender: 'noreply@truthy.com',
    subject: 'Set Password',
    isDefault: true,
    body: "<p>Hi {{username}},</p><p>A new account has been created using your email. Please use following link to set password for your account. Please note this link is only valid for the next hour.</p><p>{{link}}</p><p>If you haven't requested the code please ignore the email.</p><p>Thank you!.</p>",
  },
];

export { templates };
