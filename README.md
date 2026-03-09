# MERN Employee Management System

## Project Overview

This project is a **MERN stack web application** that implements **user
authentication and protected CRUD operations** for managing employee
records.

The system allows registered users to log in and securely perform
**Create, Read, Update, and Delete (CRUD)** operations on employee data
through a web interface.

This project demonstrates the implementation of a full-stack application
using modern web technologies including **MongoDB, Express, React, and
Node.js**, along with **JWT-based authentication**.

------------------------------------------------------------------------

# Tech Stack

### Frontend

-   React.js
-   Axios
-   Bootstrap

### Backend

-   Node.js
-   Express.js
-   MongoDB Atlas
-   Mongoose
-   JSON Web Tokens (JWT)
-   bcrypt (password hashing)

------------------------------------------------------------------------

# Features

## Authentication

-   User registration
-   Password hashing using bcrypt
-   User login with JWT token generation
-   Protected routes requiring authentication

## Employee Management

Authenticated users can:

-   Create employee records
-   View employee list
-   Update employee information
-   Delete employee records

## Security

-   JWT authentication middleware protects employee endpoints
-   Passwords are hashed before storing in the database

------------------------------------------------------------------------

# Project Structure

    gallium31-mern
    │
    ├── backend
    │   ├── models
    │   │   ├── User.js
    │   │   └── Employee.js
    │   │
    │   ├── routes
    │   │   ├── authRoutes.js
    │   │   └── employeeRoutes.js
    │   │
    │   ├── middleware
    │   │   └── authMiddleware.js
    │   │
    │   ├── server.js
    │   └── .env
    │
    └── frontend
        ├── src
        │   ├── pages
        │   │   ├── Login.jsx
        │   │   ├── Register.jsx
        │   │   └── Employees.jsx
        │   │
        │   ├── components
        │   │   └── ProtectedRoute.jsx
        │   │
        │   ├── api
        │   │   └── api.js
        │   │
        │   ├── App.js
        │   └── index.js

------------------------------------------------------------------------

# Installation Guide

## 1. Clone the Repository

    git clone https://github.com/your-repository-url.git
    cd gallium31-mern

------------------------------------------------------------------------

# Backend Setup

Navigate to the backend folder:

    cd backend

Install dependencies:

    npm install

Create a `.env` file inside the backend folder:

    PORT=5050
    MONGO_URI=your_mongodb_atlas_connection_string
    JWT_SECRET=your_jwt_secret_key

Start the backend server:

    npm run dev

The backend server will run at:

    http://localhost:5050

------------------------------------------------------------------------

# Frontend Setup

Navigate to the frontend folder:

    cd frontend

Install dependencies:

    npm install

Start the React development server:

    npm start

The frontend application will run at:

    http://localhost:3000

------------------------------------------------------------------------

# API Endpoints

## Authentication

Register user

    POST /api/auth/register

Login user

    POST /api/auth/login

------------------------------------------------------------------------

## Employee CRUD (Protected)

Get employees

    GET /api/employees

Create employee

    POST /api/employees

Update employee

    PUT /api/employees/:id

Delete employee

    DELETE /api/employees/:id

------------------------------------------------------------------------

# Authentication Header

All protected routes require a JWT token in the request header.

Example:

    Authorization: Bearer <JWT_TOKEN>

------------------------------------------------------------------------

# Testing

The application was tested using:

-   Postman for backend API testing
-   Browser testing for frontend functionality

------------------------------------------------------------------------

# Author

**Sherville Valdez**\
BS Computer Science\
Mapúa University
