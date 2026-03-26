const models = {
  employees: {
    label: "Employees",
    fields: {
      firstName: { type: "string", required: true },
      lastName: { type: "string", required: true },
      email: { type: "string", required: true, format: "email" },
      department: { type: "string", required: false },
      salary: { type: "number", required: false },
      hiredAt: { type: "date", required: false },
    },
  },

  products: {
    label: "Products",
    fields: {
      name: { type: "string", required: true },
      sku: { type: "string", required: true },
      price: { type: "number", required: true },
      stock: { type: "number", required: false },
      expiryDate: { type: "date", required: false },
    },
  },
};

module.exports = models;