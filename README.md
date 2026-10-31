# Nestly

Nestly is a full-stack accommodation marketplace for discovering stays,
publishing properties, checking availability, and making room-based
reservations.

The application combines a React/Vite client with an Express/MongoDB API. It
includes free OpenStreetMap mapping and geocoding, Cloudinary image uploads,
session authentication, server-side booking validation, and natural-language
search powered by OpenRouter's `openrouter/free` model.

## Product capabilities

### Discovery

- Search by listing title, description, city, or country
- Filter by country, maximum nightly price, amenities, room type, map location,
  and booking dates
- Sort by price, title, or newest listing
- Browse paginated results with 12 listings per page
- View listings on an interactive Leaflet/OpenStreetMap map
- Open an individual listing with its location, room details, amenities,
  reviews, and booking form

### Listing management

- Create, edit, and delete listings
- Upload images with Cloudinary and Multer
- Geocode a listing's city and country through the OpenStreetMap provider
- Store coordinates as GeoJSON
- Define 15 amenities such as WiFi, pool, kitchen, workspace, balcony, garden,
  gym, and pet-friendly access
- Define room types such as private room, entire home, suite, deluxe room, and
  shared room
- Configure inventory for multiple room types, for example five suites and
  ten deluxe rooms

### Accounts and authorization

- Sign up, log in, and log out with Passport local authentication
- Persist sessions in MongoDB
- View a personal profile with listings, reviews, and activity statistics
- Restrict listing updates and deletion to listing owners
- Restrict review deletion to review authors
- Restrict booking cancellation to the guest who created the booking

### Reservations

- Select check-in and check-out dates with a calendar range picker
- Select a room type when a listing has multiple room types
- Calculate the number of nights and estimated total before submitting
- Reject invalid, past, or overlapping dates
- Allow multiple guests to book the same dates while room capacity remains
- Reject a booking when all rooms of the selected type are occupied
- Store booking dates, room type, guest, listing, and status in MongoDB
- View booked date ranges on listing pages
- View and cancel reservations from My Bookings
- Show confirmation feedback and confetti after a successful booking

### AI assistant

- Search for stays using natural language
- Filter AI results by location, country, keyword, price, amenities, and room
  type
- Check availability for a listing and date range
- Use controlled server-side tools instead of exposing arbitrary MongoDB queries
- Keep the OpenRouter API key on the backend
- Validate message size and conversation length
- Apply per-IP rate limiting

## Architecture

```text
React + Vite frontend
        |
        | JSON, multipart forms, HTTP-only session cookie
        v
Express API
  |-- Passport + MongoDB sessions
  |-- Zod request validation
  |-- Listing, review, user, booking, and AI controllers
  |-- OpenStreetMap geocoding
  |-- Cloudinary image storage
        |
        v
MongoDB
```

In development, Vite proxies API requests to Express. In production, the
Express server can serve the generated `frontend/dist` directory, or the
frontend and backend can be deployed separately.

## Technology stack

### Frontend

| Technology | Purpose |
| --- | --- |
| React 19 | Component-based user interface |
| Vite 7 | Development server and production bundling |
| React Leaflet and Leaflet | Interactive maps and markers |
| OpenStreetMap | Free map tiles |
| React Day Picker | Booking date-range selection |
| date-fns | Date calculations |
| Lucide React | Interface icons |
| canvas-confetti | Booking confirmation effect |
| JSX and CSS | Reusable components and styling |

### Backend

| Technology | Purpose |
| --- | --- |
| Node.js 22 | JavaScript runtime |
| Express 5 | HTTP API and middleware |
| MongoDB and Mongoose 8 | Persistence and data models |
| Passport and passport-local | Local authentication |
| express-session and connect-mongo | Persistent HTTP sessions |
| Cloudinary and Multer | Image upload and storage |
| Zod | Request validation |
| node-geocoder | Address-to-coordinate conversion |
| OpenStreetMap | Free geocoding provider |
| Vercel AI SDK and OpenRouter | AI search and availability tools |

## Project structure

```text
Nestly/
├── backend/
│   ├── app.js                    # Express app, sessions, CORS, routes
│   ├── cloudConfig.js            # Cloudinary/Multer configuration
│   ├── middleware.js             # Auth, ownership, parsing, validation
│   ├── schema.js                 # Zod schemas
│   ├── controllers/
│   │   ├── ai.js                 # OpenRouter chat endpoint
│   │   ├── bookings.js           # Availability and booking operations
│   │   ├── listings.js           # CRUD, filters, pagination, geocoding
│   │   ├── reviews.js            # Review operations
│   │   └── users.js              # Account and profile operations
│   ├── middleware/
│   │   ├── rateLimit.js          # Auth and booking request limits
│   │   └── rateLimitAi.js        # AI request limit
│   ├── models/
│   │   ├── booking.js            # Dates, room type, guest, status
│   │   ├── listing.js            # Amenities, room inventory, GeoJSON
│   │   ├── review.js             # Ratings and comments
│   │   └── user.js               # Passport user model
│   ├── routes/                   # Express route definitions
│   ├── utils/
│   │   ├── aiTools.js            # Safe listing and availability tools
│   │   ├── ExpressError.js       # API error type
│   │   └── wrapAsync.js           # Async controller wrapper
│   └── init/
│       ├── data.js               # Sample listing source data
│       └── index.js              # Seed script
├── frontend/
│   ├── index.html                # Browser entry document
│   ├── vite.config.js            # API proxy configuration
│   └── src/
│       ├── App.jsx               # Client-side page switching
│       ├── context/              # Session and flash state
│       ├── components/           # Shared layout, map, cards, and UI
│       ├── pages/                # Listing, user, booking, and static pages
│       └── utils/api.js          # Frontend API client
├── package.json                  # Root development scripts
└── README.md
```

## Requirements

- Node.js 22.17.0 recommended
- MongoDB local server or MongoDB Atlas
- Cloudinary account for image uploads
- OpenRouter API key for the AI assistant

The backend declares Node.js 22.17.0 as its supported engine. Other recent
Node.js versions may work but are not the tested target.

## Installation

```bash
git clone https://github.com/ShanmukhaRajah22/Nestly.git
cd Nestly
npm run install:all
```

To install applications separately:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Environment configuration

Create `backend/.env`:

```env
ATLASDB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/wanderlust
SECRET=replace_with_a_long_random_session_secret
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
OPENROUTER_API_KEY=your_openrouter_api_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

For local MongoDB:

```env
ATLASDB_URL=mongodb://127.0.0.1:27017/wanderlust
```

For more than one allowed frontend origin, use a comma-separated
`FRONTEND_URLS` value. In production, use the deployed frontend's HTTPS
origin.

The frontend reads the backend URL from `VITE_API_URL`. It can remain empty
locally because Vite uses the configured development proxy:

```env
VITE_API_URL=
```

Never put `OPENROUTER_API_KEY`, Cloudinary secrets, or `SECRET` in frontend
files or frontend environment variables.

## Seed data

The seed script recreates 25 sample listings and assigns at least five
amenities, four room types, and room inventory to each listing:

```bash
npm run seed
```

The script clears the existing seeded listings before inserting new ones. Run
it only when replacing the listing data in the target database is acceptable.

## Local development

Start the backend:

```bash
npm run dev:backend
```

Start the frontend in a second terminal:

```bash
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173).

## Production build

Build the frontend:

```bash
npm run build:frontend
```

The root build installs both applications and then builds the frontend:

```bash
npm run build
```

For a single-service deployment, set `NODE_ENV=production` and start Express:

```bash
npm start
```

Express will serve `frontend/dist` when it is present. The frontend and
backend may also be deployed as separate services.

## API reference

Requests use JSON unless an endpoint accepts a multipart listing form.
Authenticated requests use the HTTP-only session cookie.

### Authentication and profile

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/signup` | Create an account | No |
| POST | `/login` | Start a session | No |
| GET | `/logout` | End the current session | No |
| GET | `/me` | Return the current session user | No |
| GET | `/users/me` | Return profile, listings, reviews, and stats | Yes |

### Listings

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/listings` | Return a filtered, sorted page of listings | No |
| GET | `/listings/:id` | Return one listing with reviews | No |
| POST | `/listings` | Create a listing and geocode its address | Yes |
| PUT | `/listings/:id` | Update a listing | Owner |
| DELETE | `/listings/:id` | Delete a listing | Owner |

`GET /listings` supports these query parameters:

| Parameter | Example | Description |
| --- | --- | --- |
| `page` | `2` | Page number, starting at 1 |
| `limit` | `12` | Results per page, capped by the server |
| `search` | `beach` | Searches title, description, location, and country |
| `location` | `Goa` | Location filter |
| `country` | `India` | Exact country filter |
| `maxPrice` | `3000` | Maximum nightly price |
| `amenity` | `WiFi` | Required amenity |
| `roomType` | `Suite` | Room type filter |
| `mapOnly` | `true` | Return listings with coordinates |
| `sort` | `priceAsc` | `priceAsc`, `priceDesc`, `title`, or `newest` |

The response contains `listings` and a `pagination` object with `page`, `limit`,
`total`, and `pages`.

### Reviews

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/listings/:id/reviews` | Add a rating and comment | Yes |
| DELETE | `/listings/:id/reviews/:reviewId` | Delete a review | Author |

### Bookings

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/listings/:id/bookings` | Return confirmed date ranges and room types | No |
| POST | `/listings/:id/bookings` | Create a room reservation | Yes |
| DELETE | `/listings/:id/bookings/:bookingId` | Cancel your reservation | Yes |
| GET | `/bookings/me` | Return the current user's reservations | Yes |

## Booking availability and concurrency

A booking stores:

```js
{
  listing,
  guest,
  checkIn,
  checkOut,
  roomType,
  status
}
```

For a requested date range, the server considers a booking overlapping when:

```text
existing.checkIn < requested.checkOut
AND existing.checkOut > requested.checkIn
```

Back-to-back stays are therefore allowed. The server counts overlapping
confirmed bookings for the selected room type and compares that count with
the room type's `totalRooms` capacity.

For example, if a listing has five suites, four overlapping suite bookings
still allow another suite booking. A sixth overlapping suite booking is
rejected with HTTP `409`. Bookings for a different room type use separate
capacity.

The application also serializes booking checks for the same listing and room
type within one running Node.js process. This prevents two simultaneous
requests from both consuming the final room on that server instance.

For a horizontally scaled deployment with multiple backend instances, a
database-level transaction or atomic inventory reservation would be required
for strict cross-instance locking. The current implementation is intentionally
simple and suitable for the application's single-process deployment model.

## AI assistant

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/ai/chat` | Search listings or check availability | No |

Example request:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Show suite stays in Goa with WiFi under 3000"
    }
  ]
}
```

The backend always uses OpenRouter's `openrouter/free` model. Messages are
validated to a maximum of 12 messages and 1,000 characters per message. The
assistant can call only the application's listing search and availability
tools.

## Maps and geocoding

- Leaflet renders maps in React.
- OpenStreetMap supplies free map tiles.
- No frontend map API key is required.
- `node-geocoder` uses the free `openstreetmap` provider.
- Listing create/update operations geocode the submitted location.
- Coordinates are stored as:

```js
{
  type: "Point",
  coordinates: [longitude, latitude]
}
```

## Validation and security

- Listing, review, and booking payloads are validated with Zod.
- Private operations require an authenticated session.
- Listing and review authorization is checked on the server.
- Sessions are persisted through `connect-mongo`.
- AI requests are rate-limited to 10 requests per 15 minutes per IP.
- Login and signup requests are limited to 10 requests per 15 minutes per IP.
- Booking creation is limited to 30 requests per 15 minutes per IP.
- User input is converted into controlled filters rather than arbitrary
  MongoDB queries.
- Secrets are read only by the backend.
- Booking overlap and capacity checks run on the server.

The rate limiters use in-memory state. For multiple backend instances, use a
shared rate-limit store such as Redis.

## Available scripts

Run from the repository root:

| Command | Description |
| --- | --- |
| `npm run install:all` | Install backend and frontend dependencies |
| `npm run dev:backend` | Start Express with Nodemon |
| `npm run dev:frontend` | Start the Vite development server |
| `npm run build:frontend` | Build the frontend |
| `npm run build` | Install dependencies and build the frontend |
| `npm run seed` | Recreate the 25 sample listings |
| `npm start` | Start the backend |

Frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

## Deployment checklist

1. Provision MongoDB and Cloudinary.
2. Configure all backend environment variables.
3. Configure `FRONTEND_URL` or `FRONTEND_URLS` for the deployed frontend.
4. Configure `VITE_API_URL` if frontend and backend are separate services.
5. Use HTTPS in production so secure session cookies work correctly.
6. Build the frontend with `npm run build:frontend`.
7. Confirm the deployed frontend can create a session and call protected
   endpoints.
8. Run the seed command only if the target database should be replaced with
   the sample listings.

## Contributing

1. Create a focused feature branch.
2. Keep changes small and consistent with the existing React/Express patterns.
3. Run the relevant lint and build commands.
4. Document behavior changes in the README when appropriate.
5. Open a pull request with a clear summary and validation details.

## License

This project is licensed under the ISC license.

---

Built with React, Express, MongoDB, OpenStreetMap, and OpenRouter by
**Shanmukha Rajah**.
