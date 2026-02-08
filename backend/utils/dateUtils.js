const { addDays, addWeeks, addMonths, startOfDay, isBefore, isAfter, format } = require('date-fns');

/**
 * Calculate next payday based on income source configuration
 */
const calculateNextPayday = (incomeSource, fromDate = new Date()) => {
  const { frequency, paySchedule } = incomeSource;
  let nextPayday = new Date(fromDate);

  switch (frequency) {
    case 'daily':
      nextPayday = addDays(nextPayday, 1);
      break;

    case 'weekly':
      // paySchedule.dayOfWeek: 0 (Sunday) - 6 (Saturday)
      const targetDay = paySchedule.dayOfWeek;
      const currentDay = nextPayday.getDay();
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7;
      nextPayday = addDays(nextPayday, daysToAdd);
      break;

    case 'biweekly':
      // Find next occurrence of target weekday, then ensure it's 2 weeks from last pay
      const biweeklyTargetDay = paySchedule.dayOfWeek;
      const biweeklyCurrentDay = nextPayday.getDay();
      let biweeklyDaysToAdd = biweeklyTargetDay - biweeklyCurrentDay;
      if (biweeklyDaysToAdd <= 0) biweeklyDaysToAdd += 14;
      else biweeklyDaysToAdd += 7; // Ensure it's at least a week away
      nextPayday = addDays(nextPayday, biweeklyDaysToAdd);
      break;

    case 'monthly':
      // paySchedule.date: 1-31
      const targetDate = paySchedule.date || 1;
      nextPayday = new Date(nextPayday.getFullYear(), nextPayday.getMonth(), targetDate);
      
      // If we've passed this month's payday, move to next month
      if (isBefore(nextPayday, fromDate) || nextPayday.getTime() === fromDate.getTime()) {
        nextPayday = addMonths(nextPayday, 1);
      }
      
      // Handle months with fewer days (e.g., Feb 30 -> Feb 28)
      const maxDayInMonth = new Date(nextPayday.getFullYear(), nextPayday.getMonth() + 1, 0).getDate();
      if (targetDate > maxDayInMonth) {
        nextPayday.setDate(maxDayInMonth);
      }
      break;

    default:
      nextPayday = addDays(nextPayday, 1);
  }

  return startOfDay(nextPayday);
};

/**
 * Calculate days until next payday
 */
const daysUntilPayday = (nextPayday) => {
  const today = startOfDay(new Date());
  const payday = startOfDay(new Date(nextPayday));
  const diffTime = payday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Check if today is a payday
 */
const isPayday = (incomeSource) => {
  const today = startOfDay(new Date());
  const { frequency, paySchedule } = incomeSource;

  switch (frequency) {
    case 'daily':
      return true;

    case 'weekly':
      return today.getDay() === paySchedule.dayOfWeek;

    case 'biweekly':
      // Would need to track last payday to determine this accurately
      // For now, just check if it's the right day of week
      return today.getDay() === paySchedule.dayOfWeek;

    case 'monthly':
      return today.getDate() === paySchedule.date;

    default:
      return false;
  }
};

/**
 * Get current period start date based on frequency
 */
const getCurrentPeriodStart = (frequency, referenceDate = new Date()) => {
  const date = startOfDay(referenceDate);

  switch (frequency) {
    case 'daily':
      return date;

    case 'weekly':
      // Start of current week (Monday)
      const dayOfWeek = date.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      return addDays(date, diff);

    case 'biweekly':
      // This would need more context, defaulting to 2 weeks back
      return addWeeks(date, -2);

    case 'monthly':
      // Start of current month
      return new Date(date.getFullYear(), date.getMonth(), 1);

    default:
      return date;
  }
};

/**
 * Format date for display
 */
const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  return format(new Date(date), formatStr);
};

module.exports = {
  calculateNextPayday,
  daysUntilPayday,
  isPayday,
  getCurrentPeriodStart,
  formatDate
};
