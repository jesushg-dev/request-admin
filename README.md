# Web System for Service Request Management

## Overview

This web system has been designed to optimize the management of service requests in the telecommunications industry. The system implements modern web technologies such as React, Next.js, Prisma, and TypeScript to deliver a scalable, user-friendly, and efficient platform for managing service requests.

The development follows the **Waterfall Methodology**, a structured and sequential approach ideal for achieving clear objectives at each phase. Combined with modern tools and best practices, this methodology ensures a robust and maintainable system.

## Features

### General

- Multi-tenant architecture to manage multiple organizations.
- Role-based access control (RBAC) with granular permissions.
- Notifications: System, push, and email.
- Fully responsive design for desktop and mobile devices.
- Light/Dark theme support.

### Request Management

- Request lifecycle tracking:
  - Draft
  - Under Review
  - Canceled
  - In Progress
  - Closed
- Categorization and prioritization of requests (High, Medium, Low).
- Real-time notifications for status changes and updates.
- Reports: Customizable and exportable in PDF/Excel formats.
- Workflow creation and management for streamlined operations.

### Technologies

- **Frontend**: React, Next.js, TypeScript.
- **Backend**: TRPC, NextAuth.
- **Database**: SQL Server with Prisma ORM.
- **Development Tools**: Visual Studio Code, Visual Paradigm, Git.
- **Testing Tools**: Cypress, Jest.
- **Prototyping**: Justinmind, Case Studio 2.

## Objectives

### General Objective

Develop a web system for managing service requests efficiently while adhering to IT best practices.

### Specific Objectives

1. Analyze the current system requirements and adapt ITIL-compliant practices for request fulfillment.
2. Design the web system using mockups and UML diagrams for precise modeling.
3. Implement the system using state-of-the-art technologies, ensuring version control via Git.
4. Conduct thorough testing to validate the system's functionality.
5. Deploy the system in a secure and reliable environment.

## Installation and Deployment

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo-name.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the `.env` file with required environment variables.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Build and deploy using the appropriate server configuration:
   ```bash
   npm run build && npm run start
   ```

## Testing

- End-to-end testing with Cypress.
- Unit testing with Jest.
- Continuous integration configured for automatic test execution.

## Future Enhancements

- Real-time chat integration.
- Advanced analytics and insights.
- AI-based recommendations for request prioritization.
- Support for internationalization (i18n).

## Useful Commands

- Seed database: npx prisma db seed

## Useful Links

- [WAAPI App](https://waapi.app/)
- [Chromatic Sortable Tree Example](https://master--5fc05e08a4a65d0021ae0bf2.chromatic.com/?path=/story/examples-tree-sortable--all-features)
- [ShadCN Form Playground](https://www.shadcn-form.com/playground)
