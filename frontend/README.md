# FeedMap AI Frontend

React frontend built with Vite, Tailwind CSS, React Router, and Axios.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Folder Structure

- `src/main.jsx` mounts React and the router.
- `src/App.jsx` defines public, protected, and dashboard routes.
- `src/api/` contains Axios setup and API helpers.
- `src/components/` contains shared UI pieces such as protected routes, dashboard navigation, donation cards, status badges, and modals.
- `src/context/` stores global React state, including authentication.
- `src/layouts/` contains reusable page shells such as the dashboard layout.
- `src/pages/` contains route-level pages like login, signup, and dashboards.
- `src/styles/` contains Tailwind entry styles.

## Routes

- `/login`
- `/signup`
- `/dashboard`
- `/dashboard/donor`
- `/dashboard/ngo`
- `/dashboard/delivery`
- `/dashboard/admin`

## Donation Flow

Donors can create donations from the donor dashboard. The form submits to `POST /api/donations`, cards load from `GET /api/donations/mine`, and every request uses the stored JWT through the Axios interceptor.
