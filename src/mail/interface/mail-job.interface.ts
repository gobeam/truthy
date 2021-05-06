export interface MailJobInterface {
  to: string;
  template: string;
  subject: string;
  context: any;
}
