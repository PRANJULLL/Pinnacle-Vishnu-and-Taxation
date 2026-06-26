# CA Office Management System

Internal web application for a Chartered Accountant office to manage filing tasks, employee workload, invoices, and reports.

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, TanStack Table, React Hook Form, Recharts
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **PDF:** PDFKit with QR codes

## Prerequisites

- Node.js 20+
- MongoDB running locally on `mongodb://127.0.0.1:27017`

## Setup

### 1. Install dependencies

```bash
npm install
cd server && npm install
cd ../client && npm install
```

Or from root after installing concurrently:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Configure environment

Server (`.env` in `server/`):

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/office-management
```

Client (`.env.local` in `client/`):

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB

Ensure MongoDB is running on your machine.

### 4. Run the application

From the project root:

```bash
npm run dev
```

Or run separately:

```bash
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Dashboard** — Task stats and charts (by employee, client, revenue, status)
- **Tasks** — Full CRUD with search, filters, pagination, sorting
- **Client Filter** — Filter all data by Pinnacle, Vishnu, or Clear Tax
- **Employees** — Workload stats and assigned tasks per expert
- **Invoices** — PDF generation with QR code and bank details
- **Reports** — Revenue analytics with Excel/PDF export
- **Auto Stuck Logic** — Pending tasks auto-marked Stuck after 24 hours
- **Dark Mode** — Toggle in header or Settings
- **No Authentication** — Open access for office computer use

## Project Structure

```
Management-System/
├── client/          # Next.js frontend
├── server/          # Express API + MongoDB
└── package.json     # Root scripts
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks with filters |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/dashboard/charts` | Chart data |
| GET | `/api/employees/stats/all` | All employee stats |
| POST | `/api/invoices/generate/:taskId` | Generate invoice PDF |
| GET | `/api/reports/export/excel` | Export tasks to Excel |
| GET | `/api/reports/export/pdf` | Export report PDF |

## Sample Data

On first server start, clients (Pinnacle, Vishnu, Clear Tax) and employees (Jay, Mohan, Prem, Vivek) are seeded automatically. Add tasks via the **Add Task** button on the Tasks page.
