# 🎉 iCore Celebrations – Frontend

iCore Celebrations is a **React frontend application** for a birthday event planning platform.  
Users can explore themes, venues, services, and create customized celebration plans.

The frontend is deployed on **Vercel** and connects to a backend API hosted on **Render**.

---

## 🌐 Live Links

- 🚀 Frontend: https://isha-s.vercel.app  
- 🔗 Backend API: https://icore-backend.onrender.com  

---

## ⚙️ Tech Stack

- React.js (Create React App)
- React Router DOM
- Axios
- Tailwind CSS
- ShadCN UI
- Lucide React Icons
- Sonner (toast notifications)
- Date-fns

---

## ✨ Features

- Browse birthday themes (bento grid UI)
- View venues with images, pricing, and capacity
- Explore services and packages
- Create personalized event plans
- Select venue, date, and guest count
- Authentication (login/register)
- Protected user routes
- Admin dashboard support
- Fully responsive UI

---

## 🔗 Backend Integration

This frontend connects to a separate backend API.

```env
REACT_APP_BACKEND_URL=https://icore-backend.onrender.com


All API calls are managed in: 
        src/services/api.js



## Getting Started (Local Setup)

### Clone the repository:
```bash

git clone https://github.com/isha24khan-commits/isha-s-.git
cd isha-s-/frontendi

Install dependencies:
npm install
    
Create environment file:
REACT_APP_BACKEND_URL=https://icore-backend.onrender.com


Start development server:
npm start
