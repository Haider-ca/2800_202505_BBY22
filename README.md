# PathPal

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
│   ├── config                   # Cloudinary and DB connection settings
│   ├── map                      # Map-related route handling and services
│   ├── models                   # Mongoose models for various entities
│   ├── poi                      # POI (Point of Interest) logic and routing
│   ├── post                     # General post logic and routing
│   ├── profile                  # User profile-related routes and services
│   ├── routes                   # General-purpose routes like auth, contact
│   ├── savePost                 # Logic for saving posts (bookmarks)
│   ├── utils                    # Helper utilities (file uploads, POI helpers)
│   ├── vote                     # Voting system (like/dislike)
│   └── server.js                # Main server entry point
├── public
│   ├── data                     # GeoJSON data layers for map
│   ├── icons, img, logo         # UI media assets
│   ├── partials                 # Shared HTML components like navbar
│   └── help.html, index.html    # Public pages
├── src
    ├── css                      # All custom styling grouped by module
    ├── html                     # Main pages including login/register/map/route/POI/feed/profile
    ├── script                   # JS files for map, route, feed, POI, post, etc.
    └── utils                    # Shared front-end JS utilities (e.g. renderCard, authCheck)


---

## 📄 Reusable modules and Descriptions

The project includes several reusable front-end modules that handle common tasks such as rendering cards, checking login status, managing votes and saves, showing toast messages, and storing constants:

- `src/utils/` – A collection of reusable front-end utility modules that help keep the codebase clean and DRY. It includes:
  - `authCheck.js` – checks if the user is logged in
  - `renderCard.js` – generates card UI for posts and POIs
  - `vote.js`, `save.js` – handle front-end logic for voting and saving
  - `toast.js`, `profileToast.js` – show custom toast notifications
  - `helpers.js`, `constants.js`, `instruction.js` – provide shared logic and constants used across scripts


---

## Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/Haider-ca/2800_202505_BBY21.git
   cd pathpal
   ```

2. **Install dependencies**
   ```bash
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
   node server.js
   ```

5. Visit [http://localhost:your_port](http://localhost:your_port)

---

## ✨ Features

- **Community Feed**  
  View and interact with posts from other users. Includes POIs, general posts, and announcements. Supports search, filter, sort, and infinite scroll.

- **Add POI (Point of Interest)**  
  Click on the map or search a location, fill in details, and submit. Includes media upload and reverse-geocoded address.

- **Save & Vote**  
  Save favorite POIs or posts and routes. Vote anonymously using a locally stored `voterId` to prevent abuse (1 vote per post per user).

- **Map Navigation**  
  Use the navigation feature from a POI card or saved route card to jump to the map and start navigation to that location using Mapbox Directions.


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
