# FilMix — Movie Web Application

A full-stack web platform for movie lovers to browse, search, and manage a film catalog. The application uses a dynamic server-side rendering architecture with EJS templates, features user authentication, a comprehensive movie catalog, interactive user features, and a powerful Admin Panel integrated with the TMDB API for seamless content management.

## 🚀 Key Features

### 👤 User Features
- **Authentication**: Secure registration and login system.
- **Dynamic Home Page**:
  - Main promotional banner featuring popular movies.
  - Dynamic movie selections/collections.
  - Informative "Our Advantages" section.
- **Interactive Movie Profiles**:
  - Detailed movie information, including cast lists.
  - Built-in movie trailer player.
  - User reviews section with the ability to leave comments.
  - "Favorites" system to save movies for later.
- **Advanced Catalog**: Comprehensive movie listing with convenient search and multi-criteria filtering.

### 👑 Admin Panel Features
- **Smart Movie Importer (TMDB API)**: Admins can search for movies by title via the TMDB API and instantly add them to the local database with a single click.
- **Dynamic Collections**: Full control over movie categories on the home page (create, update, or delete selections).
- **User Management**: View all registered platform users and assign new administrators.
- **Content Management**: Complete control over deleting movies and managing existing selections.

## 🛠 Tech Stack

**Frontend:**
- EJS (Embedded JavaScript templates for server-side rendering)
- CSS3 (Custom styling)
- Vanilla JavaScript

**Backend & Database:**
- Node.js
- Express.js
- PostgreSQL

**Third-Party APIs:**
- TMDB API (The Movie Database)

## 📁 Project Structure

```text
├── app/
│   └── routes/          # Express router endpoints (admin.js, auth.js, index.js)
├── static/              # Static frontend assets
│   ├── css/             # Stylesheets
│   ├── js/              # Client-side JavaScript
│   └── media/           # Images, icons, and media files
├── templates/           # Server-side EJS templates & views
│   ├── html/            # Legacy HTML files
│   ├── partials/        # Reusable view components
│   ├── admin_reviews.ejs
│   ├── admin.ejs
│   ├── favourites.ejs
│   ├── login.ejs
│   ├── main.ejs
│   ├── movie-details.ejs
│   ├── movie.ejs
│   └── registration.ejs
├── views/partials/      # Additional view configurations
├── app.js               # Main application entry point
├── db.js                # PostgreSQL database connection configuration
├── package-lock.json
└── package.json         # Node.js dependencies and scripts

```
🔧 Local Setup & Installation
Note: Make sure you have Node.js and PostgreSQL installed and running on your local machine before starting.

## 1. Database & Environment Setup
Create a local PostgreSQL database named filmix.

Configure your database connection details inside db.js.

Ensure you have your TMDB API Key available for backend requests.

## 2. Installation & Running
```bash
# Navigate to the project root directory
cd filmix-project

# Install all required Node.js dependencies
npm install

# Start the Express server
node app.js
```
Once the server starts, open your browser and navigate to http://localhost:3000 (or your configured port) to explore the application.
