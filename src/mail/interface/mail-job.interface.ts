export interface MailJobInterface {
  to: string;
  slug: string;
  subject: string;
  context: any;
  attachments?: any;
}
