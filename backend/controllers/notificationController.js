const notificationService = require('../services/notificationService');

exports.getMine = async (req, res) => {
  try {
    const { unreadOnly } = req.query;
    const list = await notificationService.getByUser(req.user._id, {
      unreadOnly: unreadOnly === 'true',
    });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    await notificationService.markAsRead(req.user._id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user._id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await notificationService.deleteNotification(req.user._id, id);
    res.json({ success: true, message: 'Notification deleted', data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.clearAll = async (req, res) => {
  try {
    await notificationService.clearAllNotifications(req.user._id);
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
