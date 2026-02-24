// Helper for sending email reminders using EmailJS
import emailjs from 'emailjs-com';

export function sendExpiryEmail({ to_name, to_email, expiry_date }) {
  return emailjs.send(
    'YOUR_SERVICE_ID',
    'YOUR_TEMPLATE_ID',
    {
      to_name,
      to_email,
      expiry_date,
    },
    'YOUR_USER_ID'
  );
}
