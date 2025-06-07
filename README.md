# DP Generator

A display picture generator application with React frontend and Express backend.

## Project Structure

- Frontend: React application in `/src` directory
- Backend: Express API in `/server` directory
- Single entry point: `server.js` in the root directory

## Development

To run the application in development mode:

```bash
# Install dependencies
npm install

# Start both frontend and backend in development mode
npm run start:dev
```

This will start:
- Backend API server on port 3000 (http://localhost:3000/api)
- Frontend React dev server on port 3001 (http://localhost:3001)

The React development server will proxy API requests to the backend server.

## Production

To run the application in production mode:

```bash
# Build the React frontend
npm run build

# Start the production server
npm start
```

This will:
- Build the React frontend into the `/build` directory
- Start the Express server which will serve both the API and the static frontend files
- The application will be available at http://localhost:3000

## Available Scripts

- `npm run start:dev` - Start both frontend and backend in development mode
- `npm run start:react` - Start only the React development server
- `npm run start:server` - Start only the backend API server with nodemon
- `npm run build` - Build the React frontend for production
- `npm start` - Start the production server
- `npm test` - Run tests
- `npm run eject` - Eject from create-react-app