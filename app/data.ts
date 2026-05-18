export type Notification = {
  title: string;
  body: string;
  time: string;
};

export type Enquiry = {
  name: string;
  plan: string;
  status: string;
  phone: string;
};

export const notifications: Notification[] = [
  { title: "New trial booked", body: "Rahul Sharma selected Personal Training.", time: "5 min ago" },
  { title: "Payment reminder", body: "12 memberships renew this week.", time: "28 min ago" },
  { title: "Contact message", body: "A new support message is waiting.", time: "1 hr ago" }
];

export const initialEnquiries: Enquiry[] = [
  { name: "Rahul Sharma", plan: "Personal Training", status: "New", phone: "+91 98765 12034" },
  { name: "Neha Verma", plan: "Weight Loss", status: "Called", phone: "+91 91234 88420" },
  { name: "Aman Khan", plan: "Strength Batch", status: "Joined", phone: "+91 99887 11109" }
];
