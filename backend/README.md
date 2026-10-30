# SmartRent API

## Requirements and environment

Install Node.js and npm, then configure `backend/.env`:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/smartrent
JWT_SECRET=<long-random-private-value>
```

Use a unique, randomly generated JWT secret and keep the environment file private. `MONGO_URI` points to the application database. The first administrator may be created using `POST /api/auth/register`; registration is disabled after an administrator exists.

## Start

```sh
npm install
npm start
```

`npm run dev` starts the API with Node's watch mode. The default API port is 5001. `GET /api/health` provides a basic health response.

## API and tests

Management routes are protected with a bearer JWT. Authentication endpoints are under `/api/auth`. The frontend defaults to `http://127.0.0.1:5001/api`; configure `VITE_API_BASE_URL` in the frontend environment if needed.

Run integration tests with `npm test`. They require reachable MongoDB credentials via `MONGO_URI` and `JWT_SECRET` and create a temporary uniquely named database for the test, which is dropped during cleanup. Ensure the MongoDB account can create and drop that scratch database.
