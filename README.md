# Nestly

Nestly is a full-stack travel accommodation platform where users can discover
stays, publish listings, view locations on a map, make reservations, and leave
reviews.

The project uses a React and Vite frontend with an Express and MongoDB backend.
It also includes natural-language listing search through OpenRouter's free
router and free OpenStreetMap geocoding.

## Features

### Listings

- Browse all available stays
- Search by title, location, country, or keyword
- Filter by country, maximum price, map availability, and dates
- Filter by amenities and room type
- Paginate results with 12 listings per page
- Sort by price, title, or newest listing
- Create, edit, and delete listings
- Upload listing images through Cloudinary
- View each listing's location on an OpenStreetMap map
- Store listing coordinates as GeoJSON
- Add multiple room types and room counts to one listing

### Accounts and permissions

- Sign up, log in, and log out
- Passport local authentication with MongoDB-backed sessions
- View a personal profile and listing activity
- Only listing owners can edit or delete their listings
- Only review authors can delete their reviews

### Reviews

- Add a 1-to-5 star review
- Add comments to listings
- Delete your own reviews
- View review author avatars and dates

### Bookings

- Select check-in and check-out dates with a calendar range picker
- Choose a room type when a listing has multiple room types
- Calculate nights and total price before booking
- Allow overlapping reservations while rooms remain available
- Reject a booking when all rooms of the selected type are occupied
- Store confirmed booking dates in MongoDB
- View booked date ranges on listing pages
- View all personal reservations on My Bookings
- Cancel your own confirmed reservations
- Show a centered booking confirmation dialog with confetti

### AI assistant

- Ask for listings using natural language, such as:
  `Show places under 2000 in Goa`
- Search listings using controlled, validated MongoDB filters
- Check whether a listing is available for specific dates
- Use the OpenRouter `openrouter/free` model
- Keep the API key on the backend
- Limit request size and apply a small per-IP rate limit

### UI and experience

- Responsive React interface
- Landing hero with search and filter controls
- Full-screen loading states for major page loads
- Flash notifications for successful and failed actions
- Reusable calendar, avatar, icon button, and loader components
- Leaflet markers for multiple listings and individual listing locations

## Technology stack

### Frontend

| Technology | Purpose |
| --- | --- |
| React 19 | User interface |
| Vite 7 | Development server and production build |
| React Leaflet and Leaflet | Interactive maps |
| OpenStreetMap | Free map tiles |
| React Day Picker | Booking date range selection |
| date-fns | Date calculations |
| Lucide React | UI icons |
| canvas-confetti | Booking success celebration |
| CSS and JSX components | Styling and reusable UI |

### Backend

| Technology | Purpose |
| --- | --- |
| Node.js 22 | JavaScript runtime |
| Express 5 | REST API |
| MongoDB and Mongoose 8 | Database and data models |
| Passport and passport-local | Authentication |
| express-session and connect-mongo | Persistent sessions |
| Cloudinary and Multer | Image upload and storage |
| Zod | Request validation |
| node-geocoder | Address geocoding |
| OpenStreetMap | Free geocoding provider |
| Vercel AI SDK and OpenRouter | AI listing search |

## Project structure

```text
Nestly/
├── backend/
│   ├── app.js                    # Express application and middleware
│   ├── cloudConfig.js            # Cloudinary upload configuration
│   ├── middleware.js             # Authentication and authorization helpers
│   ├── schema.js                 # Zod validation schemas
│   ├── controllers/
│   │   ├── ai.js                 # OpenRouter chat endpoint
│   │   ├── bookings.js           # Booking creation and cancellation
│   │   ├── listings.js           # Listing CRUD and geocoding
│   │   ├── reviews.js            # Review operations
│   │   └── users.js              # Authentication and profile operations
│   ├── models/
│   │   ├── booking.js            # Reservation dates and room type
│   │   ├── listing.js            # Listing, amenities, rooms, and coordinates
│   │   ├── review.js             # Listing reviews
│   │   └── user.js               # User accounts
│   ├── routes/
│   │   ├── ai.js                 # /ai routes
│   │   ├── booking.js            # Listing booking routes
│   │   ├── bookings.js           # Current-user booking routes
│   │   ├── listing.js            # Listing routes
│   │   ├── review.js             # Review routes
│   │   └── user.js               # Authentication routes
│   ├── utils/
│   │   ├── aiTools.js            # Safe AI listing and availability tools
│   │   ├── ExpressError.js       # Custom API errors
│   │   └── wrapAsync.js           # Async route wrapper
│   └── init/
│       ├── data.js               # Seed data for 25 listings
│       └── index.js              # Database seed script
├── frontend/
│   ├── index.html
│   ├── vite.config.js             # Development API proxy
│   └── src/
│       ├── App.jsx                # Application router and page switching
│       ├── context/
│       │   └── AppContext.jsx     # Session, auth, and flash state
│       ├── components/
│       │   ├── includes/          # Navbar, footer, cards, map, AI assistant
│       │   └── ui/                # Calendar, loaders, icons, and avatars
│       ├── pages/
│       │   ├── listings/          # Listing, booking, and map pages
│       │   ├── users/             # Login, signup, profile, and bookings
│       │   └── StaticPages.jsx    # Privacy, terms, and error pages
│       └── utils/
│           └── api.js             # Frontend API client
├── package.json                   # Root scripts
└── README.md
```

## Requirements

- Node.js 22.17.0 recommended
- MongoDB local instance or MongoDB Atlas
- Cloudinary account for listing images
- OpenRouter API key for AI search

Node.js 24 may work, but the backend currently declares Node.js 22.17.0 as
its supported engine.

## Installation

Clone the existing repository and install both applications:

```bash
git clone https://github.com/ShanmukhaRajah22/WanderLust.git
cd Wanderlust-using-React
npm run install:all
```

You can also install each application independently:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Environment variables

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

For a local MongoDB instance, use:

```env
ATLASDB_URL=mongodb://127.0.0.1:27017/wanderlust
```

For a deployed frontend, set `FRONTEND_URL` to the frontend's full HTTPS
origin. Multiple allowed frontend origins can be supplied through
`FRONTEND_URLS`, separated by commas.

The frontend reads its backend base URL from `VITE_API_URL`. For local
development it can remain empty because Vite proxies API requests:

```env
VITE_API_URL=
```

Never expose `OPENROUTER_API_KEY`, Cloudinary secrets, or `SECRET` in frontend
code or frontend environment variables.

## Seed the database

The seed script clears and inserts the sample data from
`backend/init/data.js`, which currently contains 25 listings:

```bash
npm run seed
```

Run this only against a database where replacing the listing seed data is
acceptable.

## Run locally

Start the backend in one terminal:

```bash
npm run dev:backend
```

Start the frontend in another terminal:

```bash
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173).

The frontend development server proxies `/listings`, `/bookings`, `/ai`,
authentication requests, and other API calls to the Express server.

## Production build

Build the React frontend:

```bash
npm run build:frontend
```

The complete root build also installs dependencies before building:

```bash
npm run build
```

When `NODE_ENV=production`, the Express server serves the generated
`frontend/dist` files as a single full-stack deployment.

Start the backend:

```bash
npm start
```

## API reference

All JSON requests require `Content-Type: application/json` unless the endpoint
uses multipart form data for an image upload. Authentication uses an HTTP-only
session cookie.

### Authentication and profile

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/signup` | Create a user account | No |
| POST | `/login` | Start a user session | No |
| GET | `/logout` | End the current session | No |
| GET | `/me` | Return the current session user | No |
| GET | `/users/me` | Return the authenticated user's profile and stats | Yes |

### Listings

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/listings` | Return all listings | No |
| GET | `/listings/:id` | Return one listing and its reviews | No |
| POST | `/listings` | Create a listing, optionally with an image | Yes |
| PUT | `/listings/:id` | Update a listing, optionally with an image | Owner |
| DELETE | `/listings/:id` | Delete a listing | Owner |

Listing create and update operations geocode the submitted address through
the OpenStreetMap provider before saving GeoJSON coordinates.

### Reviews

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/listings/:id/reviews` | Add a review | Yes |
| DELETE | `/listings/:id/reviews/:reviewId` | Delete a review | Author |

### Bookings

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/listings/:id/bookings` | Return booked date ranges for a listing | No |
| POST | `/listings/:id/bookings` | Create a reservation | Yes |
| DELETE | `/listings/:id/bookings/:bookingId` | Cancel your reservation | Yes |
| GET | `/bookings/me` | Return the current user's reservations | Yes |

The server rejects overlapping reservations using:

```text
existing.checkIn < requested.checkOut
AND existing.checkOut > requested.checkIn
```

Back-to-back reservations are allowed. Booking dates and the selected room type are stored persistently in MongoDB and
are not kept only in frontend state. A listing can define inventory such as:

```js
roomInventory: [
  { roomType: "Suite", totalRooms: 5 },
  { roomType: "Deluxe room", totalRooms: 10 }
]
```

Two guests can reserve the same dates when different rooms of the selected
type are still available. The server counts overlapping confirmed bookings for
that room type before saving a new booking. A small in-process booking lock
serializes simultaneous requests for the same listing and room type, so two
requests handled by the same server cannot both consume the final room.

### AI assistant

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/ai/chat` | Search listings or check availability with natural language | No |

Example request:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Show places under 2000 in Goa"
    }
  ]
}
```

The backend always uses the OpenRouter-compatible `openrouter/free` model.
Requests are validated, limited to 12 messages, limited to 1,000 characters per
message, and restricted to the application's listing and availability tools.

## Maps and geocoding

- Map tiles come from OpenStreetMap.
- Leaflet renders the map in the React frontend.
- No frontend map API key is required.
- `node-geocoder` uses the free `openstreetmap` provider.
- Listing coordinates are saved as GeoJSON:

```js
{
  type: "Point",
  coordinates: [longitude, latitude]
}
```

## Validation and security

- Request bodies are validated with Zod.
- Authentication and ownership middleware protect private operations.
- Sessions are stored in MongoDB through `connect-mongo`.
- AI requests are rate-limited per IP in memory.
- Login and signup requests are limited to 10 requests per 15 minutes per IP.
- Booking creation is limited to 30 requests per 15 minutes per IP.
- Secrets remain backend-only.
- User-provided listing data is not converted into arbitrary MongoDB queries.
- Booking overlap checks run on the server before a reservation is saved.

## Available scripts

Run these commands from the repository root:

| Command | Description |
| --- | --- |
| `npm run install:all` | Install backend and frontend dependencies |
| `npm run dev:backend` | Start the backend with Nodemon |
| `npm run dev:frontend` | Start the Vite development server |
| `npm run build:frontend` | Build the frontend |
| `npm run build` | Install dependencies and build the frontend |
| `npm run seed` | Replace database listings with the 25 seed entries |
| `npm start` | Start the backend |

Frontend-only commands:

```bash
cd frontend
npm run lint
npm run build
```

The seed command assigns amenities, room types, and starter room inventory to
all 25 sample listings. Run it again if an existing database was seeded before
these fields were added. It clears and recreates the sample listings.

## Deployment notes

Nestly can be deployed as separate frontend and backend services or as one
production Express service serving the React build.

For separate deployment:

1. Deploy the backend with its MongoDB, Cloudinary, session, and OpenRouter
   environment variables.
2. Set the backend `FRONTEND_URL` or `FRONTEND_URLS` to the deployed frontend
   origin.
3. Set the frontend `VITE_API_URL` to the deployed backend URL.
4. Build and deploy the frontend with `npm run build`.
5. Confirm cookies are enabled and HTTPS is used in production.

For a single service:

1. Build the frontend.
2. Set `NODE_ENV=production`.
3. Start the backend with `npm start`.
4. Ensure the backend can access the generated `frontend/dist` directory.

## Contributing

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/your-change
   ```

3. Make a focused change.
4. Run the relevant build and lint commands.
5. Commit and push your branch.
6. Open a pull request with a clear description.

## License

This project is licensed under the ISC license.

---

Built with React, Express, MongoDB, OpenStreetMap, and a lot of coffee by
**Shanmukha Rajah**.
