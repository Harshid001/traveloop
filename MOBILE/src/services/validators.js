export const isEmail = (value) => /\S+@\S+\.\S+/.test(String(value).trim());

export function validateLogin({ email, password }) {
  if (!isEmail(email)) return 'Enter a valid email address.';
  if (!password) return 'Enter your password.';
  return '';
}

export function validateRegister({ name, email, password }) {
  if (!String(name || '').trim()) return 'Enter your name.';
  if (!isEmail(email)) return 'Enter a valid email address.';
  if (String(password || '').length < 6) return 'Password must be at least 6 characters.';
  return '';
}

export function validateTrip(form) {
  if (!String(form.title || '').trim()) return 'Trip title is required.';
  if (!String(form.destinationsText || '').trim() && !form.destinations?.length) return 'Add at least one destination.';
  if (!form.startDate || !form.endDate) return 'Start and end dates are required.';
  if (new Date(form.endDate) < new Date(form.startDate)) return 'End date must be after start date.';
  if (Number(form.travelers) < 1) return 'Travelers must be at least 1.';
  return '';
}

export function validateBooking({ date, phone, travelers }) {
  if (!date) return 'Travel date is required.';
  if (!phone) return 'Phone number is required.';
  if (Number(travelers) < 1) return 'Travelers must be at least 1.';
  return '';
}

export function validateExpense({ title, amount }) {
  if (!String(title || '').trim()) return 'Expense title is required.';
  if (!Number(amount)) return 'Enter a valid expense amount.';
  return '';
}

export function validateItineraryDay({ title, date }) {
  if (!String(title || '').trim()) return 'Day title is required.';
  if (!date) return 'Date is required.';
  return '';
}
