
exports.inclusiveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Ensure valid dates
  if (isNaN(start) || isNaN(end)) return 0;

  // Calculate difference in milliseconds → days
  const diffTime = end.getTime() - start.getTime();

  // Convert milliseconds to days and add 1 for inclusivity
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return diffDays > 0 ? diffDays : 0; // Prevent negative values
};
