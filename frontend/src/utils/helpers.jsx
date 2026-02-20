export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (time) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const formatDateTime = (dateTime) => {
  const date = new Date(dateTime);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const calculateDuration = (startTime, endTime) => {
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  const minutes = Math.round((end - start) / 60000);
  return `${minutes} min`;
};

export const getInitials = (name) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  // Password requirements:
  // - Minimum 8 characters
  // - At least 1 capital letter (A-Z)
  // - At least 1 small letter (a-z)
  // - At least 1 number (0-9)
  // - At least 1 special character (!@#$%^&* etc.)
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  );
};

export const truncateText = (text, maxLength) => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
};

export const generateSlots = (startTime, endTime, slotDuration = 30) => {
  const slots = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  let current = new Date(2000, 0, 1, startHour, startMinute);
  const end = new Date(2000, 0, 1, endHour, endMinute);

  while (current < end) {
    const hours = String(current.getHours()).padStart(2, "0");
    const minutes = String(current.getMinutes()).padStart(2, "0");
    slots.push(`${hours}:${minutes}`);
    current.setMinutes(current.getMinutes() + slotDuration);
  }

  return slots;
};

export const getDayName = (date) => {
  return new Date(date).toLocaleDateString("en-US", { weekday: "long" });
};

export const getDateRange = (startDate, endDate) => {
  const dates = [];
  let current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

export const isDateInPast = (date) => {
  return new Date(date) < new Date();
};

export const getStatusColor = (status) => {
  const colors = {
    confirmed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
    rescheduled: "bg-purple-100 text-purple-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
