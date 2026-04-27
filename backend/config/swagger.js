const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Gallium31 MERN Dynamic CRUD API",
      version: "1.0.0",
      description:
        "API documentation for authentication, dynamic CRUD, RBAC, audit trails, and soft delete functionality.",
    },
    servers: [
      {
        url: "http://localhost:5050",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ApiSuccess: {
          type: "object",
          properties: {
            status: { type: "boolean", example: true },
            message: { type: "string", example: "Request successful." },
            data: { type: "object" },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            status: { type: "boolean", example: false },
            message: { type: "string", example: "Request failed." },
            error: { type: "string", example: "Error details" },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;