const SAUDI_MOBILE_PATTERN = /^(\+966|00966|966)?0?5[0-9]{8}$/;

const SAUDI_LANDLINE_PATTERN = /^(\+966|00966|966)?0?1[1234679][0-9]{7}$/;

const SAUDI_BUSINESS_PATTERN = /^(800[0-9]{7}|9200[0-9]{5})$/;

export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[\s\-()]/g, '').trim();
}

export function isValidSaudiPhone(phone: string): boolean {
  if (!phone || !phone.trim()) return false;
  const cleaned = cleanPhoneNumber(phone);
  return (
    SAUDI_MOBILE_PATTERN.test(cleaned) ||
    SAUDI_LANDLINE_PATTERN.test(cleaned) ||
    SAUDI_BUSINESS_PATTERN.test(cleaned)
  );
}

export function normalizeSaudiPhone(phone: string): string {
  const cleaned = cleanPhoneNumber(phone);

  if (/^800/.test(cleaned) || /^9200/.test(cleaned)) {
    return cleaned;
  }

  let digits = cleaned.replace(/^\+/, '');

  if (digits.startsWith('00966')) {
    digits = digits.slice(5);
  } else if (digits.startsWith('966')) {
    digits = digits.slice(3);
  }

  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return `+966${digits}`;
}

export function getPhoneValidationError(phone: string, isArabic: boolean): string | undefined {
  if (!phone || !phone.trim()) {
    return isArabic ? 'هذا الحقل مطلوب' : 'This field is required';
  }

  const cleaned = cleanPhoneNumber(phone);

  if (/[^0-9+]/.test(cleaned)) {
    return isArabic
      ? 'يُسمح فقط بالأرقام وعلامة + في البداية'
      : 'Only numbers and + at the beginning are allowed';
  }

  if (cleaned.indexOf('+') > 0) {
    return isArabic
      ? 'علامة + مسموح بها فقط في بداية الرقم'
      : '+ sign is only allowed at the beginning';
  }

  if (!isValidSaudiPhone(cleaned)) {
    return isArabic
      ? 'يرجى إدخال رقم هاتف سعودي صالح (مثال: ‎+966 5X XXX XXXX أو 05XXXXXXXX)'
      : 'Please enter a valid Saudi phone number (e.g., +966 5X XXX XXXX or 05XXXXXXXX)';
  }

  return undefined;
}
