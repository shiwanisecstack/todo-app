# todo-app
Todos App

I built this app to keep my daily tasks in one simple place. You create an account, log in, and get your own private todo list that nobody else can see.

**Live demo:** https://todo-app-ten-phi-49.vercel.app

What you can do
- Sign up, log in, and reset your password if you forget it
- Add a todo with a title and a short description
- Edit it, tick it off when it's done, or delete it

How it's built
- Frontend:** React, Vite, and Tailwind CSS, hosted on Vercel
- **Backend:** Node.js and Express, hosted on Render
- **Database:** MongoDB
- **Security:** passwords are hashed and logins use JWT tokens

Good to know
The backend runs on a free plan, so if the app hasn't been used for a while, the first login can take up to a minute to wake up. After that it's fast.