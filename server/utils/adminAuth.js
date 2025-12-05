// server/utils/adminAuth.js

const ADMIN_EMAILS = [
    "josiahiscoding@gmail.com",
    "Foodstuffhome1@gmail.com",
    "foodstuffgh.233@gmail.com"
];

function isAdmin(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}

module.exports = {
    isAdmin,
    ADMIN_EMAILS
};
