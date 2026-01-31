# MidArt Setup Guide

This guide will help you set up the MidArt platform with the Django backend and React frontend.

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

## Backend Setup (Django)

### 1. Create and activate a virtual environment

```bash
cd midart
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Apply database migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create a superuser (optional)

```bash
python manage.py createsuperuser
```

### 5. Run the Django development server

```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000/api/`

## Frontend Setup (React)

### 1. Navigate to the frontend directory

```bash
cd frontend
```

### 2. Install Node.js dependencies

```bash
npm install
```

### 3. Run the React development server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Running Both Servers

For development, you need to run both servers simultaneously:

**Terminal 1 (Django):**
```bash
cd midart
source venv/bin/activate
python manage.py runserver
```

**Terminal 2 (React):**
```bash
cd midart/frontend
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `GET /api/auth/me/` - Get current user

### Profiles
- `GET /api/profiles/{username}/` - Get profile
- `GET /api/profiles/{username}/posts/` - Get user's posts
- `GET /api/profiles/{username}/projects/` - Get user's projects
- `POST /api/profiles/{username}/follow/` - Follow user
- `POST /api/profiles/{username}/unfollow/` - Unfollow user

### Posts
- `GET /api/posts/` - List posts
- `POST /api/posts/` - Create image post
- `POST /api/posts/{id}/like/` - Like/unlike post
- `GET/POST /api/posts/{id}/comments/` - Comments

### Verbalise (Text Posts)
- `GET /api/verbalise/` - List verbal posts
- `POST /api/verbalise/` - Create verbal post
- `POST /api/verbalise/{id}/like/` - Like/unlike

### Projects
- `GET /api/projects/` - List projects
- `POST /api/projects/` - Create project
- `GET /api/projects/{id}/` - Project detail
- `POST /api/projects/{id}/support/` - Support project (funding)
- `POST /api/projects/{id}/upload_photo/` - Upload project photo

### Feed
- `GET /api/feed/` - Get user's feed

### Search
- `GET /api/search/?q=query` - Search users and projects

## Project Structure

```
midart/
├── manage.py
├── requirements.txt
├── SETUP.md
├── midart/                 # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── ...
├── social/                 # Main Django app
│   ├── models.py          # Database models
│   ├── views.py           # Template views (original)
│   ├── api_views.py       # REST API views
│   ├── serializers.py     # DRF serializers
│   ├── urls.py            # Template URLs
│   ├── api_urls.py        # API URLs
│   └── ...
└── frontend/              # React frontend
    ├── package.json
    ├── vite.config.js
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── context/
    │   └── styles/
    └── ...
```

## New Features Added

### Project Funding System
- Projects can optionally enable funding with a goal amount
- Supporters can donate to projects with optional messages
- Budget breakdown shows how funds will be used
- Progress tracking shows funding status

### Models Added
- `ProjectFunding` - Tracks funding goal and total raised
- `ProjectBudgetItem` - Individual budget line items
- `ProjectSupporter` - Donation records

## Troubleshooting

### CORS Issues
Make sure `django-cors-headers` is installed and configured in `settings.py`. The React dev server (port 3000) should be in `CORS_ALLOWED_ORIGINS`.

### Database Migrations
If you get migration errors, try:
```bash
python manage.py makemigrations social
python manage.py migrate
```

### Static Files
In production, run:
```bash
python manage.py collectstatic
```

## Building for Production

### Build React frontend
```bash
cd frontend
npm run build
```

This outputs to `../static/frontend/` which Django can serve.

### Configure Django for production
- Set `DEBUG = False`
- Configure a production database
- Set up proper static file serving
- Use environment variables for secrets
