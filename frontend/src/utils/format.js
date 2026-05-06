/**
 * Formats a number as Vietnamese Dong (VND) currency string.
 * @param {number} val - The numeric value to format.
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (val) => {
  if (val === undefined || val === null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(val);
};

/**
 * Formats a number with dot separators for price display without currency symbol.
 * @param {number} val - The numeric value to format.
 * @returns {string} The formatted number string.
 */
export const formatNumber = (val) => {
  if (val === undefined || val === null) return '0';
  return new Intl.NumberFormat('vi-VN').format(val);
};
