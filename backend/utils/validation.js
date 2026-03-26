function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateData(modelConfig, payload) {
  const errors = [];
  const fields = modelConfig.fields;

  for (const [fieldName, rules] of Object.entries(fields)) {
    const value = payload[fieldName];

    if (rules.required && (value === undefined || value === null || value === "")) {
      errors.push(`${fieldName} is required.`);
      continue;
    }

    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (rules.type === "string" && typeof value !== "string") {
      errors.push(`${fieldName} must be a string.`);
    }

    if (rules.type === "number" && typeof value !== "number") {
      errors.push(`${fieldName} must be a number.`);
    }

    if (rules.type === "date") {
      const parsed = new Date(value);
      if (isNaN(parsed.getTime())) {
        errors.push(`${fieldName} must be a valid date.`);
      }
    }

    if (rules.format === "email" && typeof value === "string" && !isValidEmail(value)) {
      errors.push(`${fieldName} must be a valid email address.`);
    }
  }

  return errors;
}

module.exports = validateData;