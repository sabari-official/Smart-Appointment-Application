const Notification = require('../models/Notification');

async function create(userId, title, message, type = 'info') {
  const notification = await Notification.create({ user: userId, title, message, type });
  return notification;
}

async function getByUser(userId, options = {}) {
  const { limit = 50, unreadOnly = false } = options;
  let query = { user: userId };
  if (unreadOnly) query.read = false;
  const list = await Notification.find(query).sort({ createdAt: -1 }).limit(limit).lean();
  return list;
}

async function markAsRead(userId, notificationId) {
  await Notification.updateOne({ _id: notificationId, user: userId }, { read: true });
}

async function markAllAsRead(userId) {
  await Notification.updateMany({ user: userId }, { read: true });
}

async function deleteNotification(userId, notificationId) {
  const notification = await Notification.findOneAndDelete({ _id: notificationId, user: userId });
  return notification;
}

async function clearAllNotifications(userId) {
  const result = await Notification.deleteMany({ user: userId });
  return result;
}

module.exports = {
  create,
  getByUser,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
};
