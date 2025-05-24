# PathPal - Team BBY21

PathPal is a community-driven web application that helps users discover and share accessible locations — such as ramps, benches, washrooms, and more. Users can explore a map of crowd-sourced POIs (Points of Interest), navigate to them, and engage with posts through voting, comments, and sharing tips with others.

---

## Project Description

PathPal empowers people with mobility needs by providing reliable, real-world information about accessible infrastructure. Through community contributions and feedback, we aim to make every trip more confident and informed.

---

## Technologies Used

### Front-End
- HTML5
- JavaScript
- Bootstrap 5
- CSS

### Middleware / Server
- Node.js
- Express.js

### Back-End
- MongoDB Atlas (NoSQL Database)
- Mongoose (ODM)

### Other Tools
- Mapbox (interactive map + reverse geocoding)
- Cloudinary (media storage)
- UUID (anonymous voter ID)
- Git & GitHub (version control)
- Render (deployment)

---

## 📁 File Structure

/pathpal
├── README.md
├── backend
│   ├── config                              # Cloudinary and DB connection settings
│   │   ├── cloudinary.js
│   │   └── databaseConnection.js
│   ├── map                                 # Map-related route handling and services
│   │   ├── controllers
│   │   │   ├── directionsController.js
│   │   │   └── ...
│   │   ├── models
│   │   │   └── routeModel.js
│   │   ├── routes
│   │   │   ├── directionsRoutes.js
│   │   │   └── ...
│   │   └── services
│   │       ├── directionsService.js
│   │       └── ...
│   ├── models                              # Mongoose models for various entities
│   │   ├── POI.js
│   │   └── ...
│   ├── poi                                 # POI (Point of Interest) logic and routing
│   │   ├── controllers
│   │   │   └── poiController.js
│   │   ├── routes
│   │   │   └── poiRoutes.js
│   │   └── services
│   │       └── poiService.js
│   ├── post                                # General post logic and routing
│   │   ├── controllers
│   │   │   └── postController.js
│   │   ├── routes
│   │   │   └── postRoutes.js
│   │   └── services
│   │       └── postService.js
│   ├── profile                             # User profile-related routes and services
│   │   ├── controllers
│   │   │   └── profileController.js
│   │   ├── routes
│   │   │   └── profileRoutes.js
│   │   └── services
│   │       └── profileService.js
│   ├── routes                              # General-purpose routes like auth, contact
│   │   ├── ai.js
│   │   └── ... 
│   ├── savePost                            # Logic for saving posts (bookmarks)
│   │   ├── controllers
│   │   │   └── savePostController.js
│   │   ├── routes
│   │   │   └── savePostRoutes.js
│   │   └── services
│   │       └── savePostService.js
│   ├── utils                               # Helper utilities (file uploads, POI helpers)
│   │   ├── poiHelpers.js
│   │   └── upload.js
│   ├── vote                                # Voting system (like/dislike)
│   │   ├── controllers
│   │   │   └── voteController.js
│   │   ├── routes
│   │   │   └── voteRoutes.js
│   │   └── services
│   │       └── voteService.js
│   ├── server.js                           # Main server entry point
│   └──.env
├── public
│   ├── data                                # GeoJSON data layers for map
│   ├── icons, img, logo                    # UI media assets
│   ├── partials                            # Shared HTML components like navbar
│   │   ├── bottomNavbar.html
│   │   └── ...
│   └── help.html, index.html               # Public pages
└── src
    ├── css                                 # All custom styling grouped by module
    │   ├── addPoi.css
    │   └── ...
    ├── html                                # Main pages including login/register/map/route/POI/feed/profile
    │   ├── feed.html
    │   └── ... 
    ├── script                              # JS files for map, route, feed, POI, post, etc.
    │   ├── addPoi.js
    │   └── ...
    └── utils                               # Shared front-end JS utilities (e.g. renderCard, authCheck)
        ├── api.js
        └── ...


---

## Reusable modules and Descriptions

The project includes several reusable front-end modules that handle common tasks such as rendering cards, checking login status, managing votes and saves, showing toast messages, and storing constants:

- `src/utils/` – A collection of reusable front-end utility modules that help keep the codebase clean and DRY. It includes:
  - `authCheck.js` – checks if the user is logged in
  - `renderCard.js` – generates card UI for posts and POIs
  - `vote.js`, `save.js` – handle front-end logic for voting and saving
  - `toast.js`, `profileToast.js` – show custom toast notifications
  - `helpers.js`, `instruction.js` – provide shared logic and constants used across scripts


---

## Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/Haider-ca/2800_202505_BBY21.git
   cd 2800_202505_BBY21
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   - In the backend folder, create a file named .env and add the following environment variables:
     ```
     MONGODB_URI=your_mongo_uri
     CLOUD_NAME=your_cloudinary_name
     CLOUD_API_KEY=your_key
     CLOUD_API_SECRET=your_secret
     MAPBOX_TOKEN=your_mapbox_token
     SESSION_SECRET=your_session_secret
     NODE_SESSION_SECRET=your_node_session_secret
     OPENROUTER_API_KEY=your_openrouter_api_key
     PORT=your_port
     ```

4. **Run the server**
   ```bash
   cd backend
   node server.js
   ```

5. Visit [http://localhost:your_port](http://localhost:your_port)

---

## ✨ Features

- **Map Features**  
  Interactive Map
  Initialize and interact with a Mapbox GL JS map centered on Metro Vancouver. Load and toggle wheelchair-friendly, senior-friendly, and user-submitted POIs with custom markers and popups.

  Routing & Directions
  Get turn-by-turn navigation using Mapbox Directions API with profiles for driving, walking, seniors, and wheelchair users. Includes geocoder inputs, current location support, live tracking, and voice guidance.

  Save Routes
  Save or remove routes via backend API with reverse-geocoded names and Bootstrap toast feedback. Share routes through URL query parameters (?routeId=…) to auto-load on page visit.

  Theming
  Switch between light, dark, and system themes. Sync Mapbox styles and icon variants dynamically and automatically respond to OS color scheme changes.

  Weather & Location
  Detect user location with the Geolocation API and fetch local weather from OpenWeatherMap. Display city, temperature, icon, and description in the UI.

  Utilities & Helpers
  Load saved routes from URL parameters, auto-fill directions inputs, generate consistent popups, and manage global state for seamless integrations.

- **Community Feed**  
  View and interact with posts from other users. Includes POIs, general posts, and announcements. Supports search, filter, sort, and infinite scroll.

- **Add POI (Point of Interest)**  
  Click on the map or search a location, fill in details, and submit. Includes media upload and reverse-geocoded address.

- **Save & Vote**  
  Save favorite POIs or posts and routes. Vote anonymously using a locally stored `voterId` to prevent abuse (1 vote per post per user).

- **Map Navigation**  
  Use the navigation feature from a POI card or saved route card to jump to the map and start navigation to that location using Mapbox Directions.

- **Profile**  
  View profile information, edit profile and delete account, reset account password. View poi posts, edit and delete posts.


- **Settings Features**  
The Settings page provides a personalized and responsive user experience with the following features:

  New Message Notification
  When a post or POI receives a like or dislike, a red dot appears on the "New Message" menu item. Clicking it will:
    Navigate to the corresponding page (e.g., feed or dashboard)
    Scroll to the specific item and highlight it for visibility

  Profile Redirect
    Clicking the profile icon or name in the navigation redirects users to their personal Profile page.

  Theme Switcher
    Users can toggle between three visual themes:
      System Default
      Dark Mode
      Light Mode

  Text Size Adjustment
    Users can cycle through three text sizes to improve readability:
      Small
      Medium
      Large

  Logout
    Instantly logs the user out and redirects them to the login screen.
  
  Contact Us
    Opens a form where users must enter a title and description before submitting feedback. A success message confirms the submission.


---

## Credits

We’d like to thank the following libraries and tools:

- Mapbox – interactive maps and geocoding
- Cloudinary – media file hosting
- ChatGPT – for technical support, explanation, and code generation assistance during development
- Bootstrap, Node.js, Express.js, MongoDB, and all open-source libraries used

---

## License

This project is for educational purposes only and not intended for commercial use.
