# 🚀 Candidates Management System (NEST + ANGULAR)

A full-stack application designed to manage job candidates efficiently. The project features a robust **NestJS** backend and a modern **Angular 19** frontend using Signals for state management.

## 📋 Table of Contents

* [Overview](#-overview)
* [System Architecture](#-system-architecture)
* [Features](#-features)
* [Tech Stack](#-tech-stack)
* [Getting Started](#-getting-started)
* [Deployment](#-deployment)

---

## Overview

This system allows recruiters to track candidates, monitor their seniority levels (Junior/Senior), check their availability, and manage their professional information through a clean, responsive interface.

## 🏗 System Architecture

The application follows a standard **Client-Server** architecture with a managed database layer:

1. **Frontend (Angular 19):** Handles the UI and State using **Signals**. It communicates with the backend via a **Functional Interceptor** that manages global loading states and authentication.
2. **Backend (NestJS):** Provides a RESTful API. It uses **TypeORM** to bridge the logic between the application and the database.
3. **Database (Supabase/PostgreSQL):** A cloud-hosted relational database that ensures data persistence and integrity.

## 🛠 Features

* **Full CRUD:** Create, Read, Update, and Delete candidates.
* **Real-time Feedback:** Integrated loading states with a specialized "Server Wake-up" alert for cloud hosting.
* **Responsive Design:** Optimized for Desktop, Tablet, and Mobile using Angular Material.
* **Signals-based State:** Leveraging Angular 19's latest reactivity features.
* **Database Integration:** Persistent storage with PostgreSQL and TypeORM.

## 💻 Tech Stack

### Frontend

* **Angular 19:** Functional interceptors, Signals, and Standalone components.
* **Angular Material:** UI components and responsive tables.
* **RxJS:** Handling asynchronous data streams.

### Backend

* **NestJS:** Modular architecture for a scalable API.
* **TypeORM:** Object-Relational Mapping for database interactions.
* **PostgreSQL:** Relational database for data integrity.

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v22.x recommended)
* npm
* PostgreSQL instance

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/FESEVA/test-candidates
cd test-candidates

```


2. **Setup Backend:**
```bash
cd backend
npm install
# Create a .env file with your DATABASE_URL
npm run start:dev

```


3. **Setup Frontend:**
```bash
cd frontend
npm install
npm run start

```



---

## 🌐 Deployment

This project is fully deployed and production-ready using the following cloud providers:

* **Backend & Frontend Hosting:** [Render](https://www.google.com/search?q=https://render.com/). The backend is configured to handle the "spin-down" effect of the free tier, and the frontend includes rewrite rules for SPA routing.
* **Database:** [Supabase](https://www.google.com/search?q=https://supabase.com/). A managed PostgreSQL instance connected via a Transaction Pooler for high-performance data handling.

> **Note:** Due to Render's free tier sleep policy, the initial request may take up to 60 seconds to wake up the service. A built-in UI alert informs users during this process.

