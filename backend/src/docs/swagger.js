/**
 * docs/swagger.js
 * -----------------------------------------------------------------------
 * OpenAPI 3.0 specification generated with swagger-jsdoc from the JSDoc
 * @openapi comments found in the route files. Served at GET /api-docs
 * via swagger-ui-express.
 * -----------------------------------------------------------------------
 */

const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'DeskFlow API',
      version: '1.0.0',
      description:
        'Internal IT Service Request Portal API. Employees can create and view their own tickets; Admins can view all tickets and update ticket status.',
      contact: {
        name: 'DeskFlow Engineering Team',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Local development server' },
      { url: 'https://deskflow-api.onrender.com', description: 'Production (Render)' },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Tickets', description: 'Ticket management endpoints' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'employee1' },
            password: { type: 'string', format: 'password', example: 'Employee@123' },
            role: { type: 'string', enum: ['employee', 'admin'], example: 'employee' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                role: { type: 'string', example: 'employee' },
                username: { type: 'string', example: 'employee1' },
              },
            },
          },
        },
        Ticket: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '665f1c2e8b1a4c0012a3b456' },
            title: { type: 'string', example: 'Laptop will not power on' },
            description: { type: 'string', example: 'Screen stays black even after holding power button.' },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High'], example: 'High' },
            status: { type: 'string', enum: ['Open', 'In Progress', 'Resolved'], example: 'Open' },
            category: {
              type: 'string',
              enum: ['Hardware', 'Software', 'Network', 'Access', 'Other'],
              example: 'Hardware',
            },
            createdBy: { type: 'string', example: '665f1a2e8b1a4c0012a3b111' },
            createdByUsername: { type: 'string', example: 'employee1' },
            resolutionNotes: { type: 'string', example: '' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateTicketRequest: {
          type: 'object',
          required: ['title', 'description', 'priority'],
          properties: {
            title: { type: 'string', example: 'Laptop will not power on' },
            description: {
              type: 'string',
              example: 'My laptop screen stays black even after holding the power button.',
            },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High'], example: 'High' },
            category: {
              type: 'string',
              enum: ['Hardware', 'Software', 'Network', 'Access', 'Other'],
              example: 'Hardware',
            },
          },
        },
        UpdateTicketStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['Open', 'In Progress', 'Resolved'], example: 'In Progress' },
            resolutionNotes: { type: 'string', example: 'Dispatched a replacement charger.' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            details: {
              type: 'array',
              items: { type: 'object' },
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Missing or invalid JWT',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
          },
        },
        ForbiddenError: {
          description: 'Authenticated but not authorized for this action',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
          },
        },
        ValidationError: {
          description: 'Request failed validation',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
