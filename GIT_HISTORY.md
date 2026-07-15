# DeskFlow — Git Commit History

Conventional Commits, in chronological order, representing how DeskFlow was built.

1. `chore: initialize monorepo structure for backend and frontend`
2. `chore(backend): scaffold express app and package.json`
3. `feat(config): add mongodb connection module with error handling`
4. `feat(models): create user schema with bcrypt password hashing`
5. `feat(models): create ticket schema with priority and status enums`
6. `feat(auth): implement jwt token generation utility`
7. `feat(middleware): add authenticateJWT, authorizeEmployee, authorizeAdmin`
8. `feat(middleware): add centralized error handler and 404 middleware`
9. `feat(validation): add express-validator chains for login and tickets`
10. `feat(auth): implement POST /api/auth/login controller and route`
11. `feat(tickets): implement POST /api/tickets (employee-only creation)`
12. `feat(tickets): implement GET /api/tickets with role-based scoping`
13. `feat(tickets): implement PUT /api/tickets/:id status update (admin-only)`
14. `feat(tickets): add GET /api/tickets/stats aggregate endpoint`
15. `docs(swagger): add OpenAPI 3.0 spec and mount swagger-ui at /api-docs`
16. `feat(security): add helmet, cors, and env-based configuration`
17. `chore(backend): add seed script for demo employee and admin accounts`
18. `chore(frontend): scaffold vite + react app structure`
19. `feat(context): implement AuthContext and ToastContext with localStorage persistence`
20. `feat(services): add axios instance with auth interceptor and error normalization`
21. `feat(pages): build LoginPage with role selector and demo credential hint`
22. `feat(components): build TicketForm, TicketCard, TicketList, StatusDropdown`
23. `feat(pages): build EmployeeDashboard with ticket creation and history`
24. `feat(pages): build AdminDashboard with search, filters, and inline status updates`
25. `docs: add root README with architecture diagram, Postman collection, and deployment configs`
