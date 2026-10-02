# QuizSheet - Online Quiz Application (MERN)

Timed MCQ quizzes with automatic scoring, attempt history and an admin panel.
Built on the same stack as your project files: Express + MongoDB (Mongoose) + JWT on the backend, React + react-router-dom on the frontend, run together with `concurrently`.

## Features
- Register / log in (JWT, 7-day expiry from `JWT_EXPIRES_IN`)
- Question bank with category, difficulty and explanation
- Admin builds quizzes by picking questions from the bank and setting a time limit
- Countdown timer driven by a server-issued end time; auto-submits at 00:00
- Answers autosave, and a refresh resumes the same attempt with the same time left
- Scoring happens on the server only, so correct answers never reach the browser before submit
- Result page with score, percentage, time taken and a per-question review
- Attempt history with best and average score; admin sees everyone's attempts

## Setup
1. Install Node 22 or newer (required by `concurrently` 10).
2. Edit `backend/.env` and set a real `MONGO_URI` (Atlas or `mongodb://127.0.0.1:27017/quiz_db`) and `JWT_SECRET`.
3. Install everything and seed:
   ```
   npm run install-all
   npm run seed
   npm run dev
   ```
4. Open http://localhost:5173

`npm run seed` creates the admin account (`admin@quiz.com` / `admin123`, change in `backend/.env`) plus a sample 8-question quiz.

## Production
```
npm run build   # builds frontend/dist
npm start       # Express serves the API and the built React app on PORT
```

## API
| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register, /login | public |
| GET | /api/auth/me | user |
| GET | /api/quizzes | user |
| POST | /api/quizzes/:id/start | user |
| POST / PUT / DELETE | /api/quizzes[/:id] | admin |
| PATCH | /api/attempts/:id/answer | owner |
| PUT | /api/attempts/:id/submit | owner |
| GET | /api/attempts/mine, /api/attempts/:id | owner |
| GET | /api/attempts | admin |
| CRUD | /api/questions | admin |
