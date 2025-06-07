This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify


## Local Development Setup

This guide will help you set up the project locally for development and testing.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Node.js and npm:** Download and install from [nodejs.org](https://nodejs.org/). npm is included with Node.js.
*   **Git:** Download and install from [git-scm.com](https://git-scm.com/).
*   **MongoDB:** Download and install from [mongodb.com](https://www.mongodb.com/try/download/community). Ensure your MongoDB server is running.

### Setup Steps

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```
    Replace `<your-repository-url>` with the actual URL of the repository and `<repository-name>` with the name of the project directory.

2.  **Backend Setup:**
    Navigate to the backend directory:
    ```bash
    cd backend
    ```

    *   **Create a `.env` file:**
        Create a file named `.env` in the `backend` directory and add the following environment variables.
        ```env
        MONGODB_URI=mongodb://localhost:27017/custom_dp_app_db
        PORT=3001

        # Cloudinary Credentials
        # Get these from your Cloudinary dashboard (https://cloudinary.com/console)
        CLOUDINARY_CLOUD_NAME=your_cloud_name
        CLOUDINARY_API_KEY=your_api_key
        CLOUDINARY_API_SECRET=your_api_secret
        ```
        *   Replace `your_cloud_name`, `your_api_key`, and `your_api_secret` with your actual Cloudinary credentials.
        *   You can change `custom_dp_app_db` to your preferred database name.
        *   The `PORT` is optional and defaults to 3001 if not specified.

    *   **Install Backend Dependencies:**
        ```bash
        npm install
        ```

    *   **Run the Backend Server:**
        ```bash
        npm start
        ```
        The backend server should now be running (typically on `http://localhost:3001`).

3.  **Frontend Setup:**
    Navigate back to the project's root directory (from the `backend` directory):
    ```bash
    cd ..
    ```
    Or, open a new terminal in the project root.

    *   **Install Frontend Dependencies:**
        ```bash
        npm install
        ```

    *   **Run the Frontend Development Server:**
        ```bash
        npm start
        ```
        The React development server should start, and your default browser should open the application (typically at `http://localhost:3000`).

4.  **Cloudinary Upload Preset:**
    The application uses an upload preset named `ml_default` in `src/CustomDpForm.js` for the Cloudinary Upload Widget.
    *   Ensure you have an upload preset named `ml_default` in your Cloudinary account settings.
    *   You can create a new one or modify an existing one. For development, you might configure it for unsigned uploads for simplicity. Go to `Settings -> Upload -> Upload Presets` in your Cloudinary dashboard.

### Usage
Once both backend and frontend servers are running:
*   Access the application via the frontend URL (e.g., `http://localhost:3000`).
*   The frontend will make API calls to the backend server.
