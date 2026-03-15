# Nexora - Startup Stock Exchange Platform

Nexora is a comprehensive platform designed for equity crowdfunding and startup investment. It connects founders with potential investors, providing a transparent and efficient environment for startup growth and capital raising.

## 🚀 Key Features

- **For Founders**: Register startups, manage equity, and attract investment.
- **For Investors**: Discover promising startups, manage portfolios, and track investments.
- **Admin Dashboard**: Oversee platform activities, manage users, and approve startup listings.
- **Real-time Tracking**: Live portfolio trends and startup valuations.
- **Security**: Robust authentication and authorization using JWT and Spring Security.

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.4.3
- **Language**: Java 17
- **Database**: MySQL
- **ORM**: Spring Data JPA
- **Security**: Spring Security & JWT
- **Build Tool**: Maven

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Vanilla CSS
- **State Management**: Zustand
- **Charting**: Recharts
- **API Client**: Axios

### Infrastructure
- **Containerization**: Docker & Docker Compose

## 🚦 Getting Started

### Prerequisites
- Java 17
- Node.js (v18+)
- MySQL
- Docker (optional)

### Setup Instructions

#### 1. Database Setup
1. Create a MySQL database named `nexora`.
2. Import the database schema from `db_schema_nexora.sql`.
3. (Optional) Run `migration_dump.sql` for initial data.

#### 2. Backend Setup
```bash
git clone https://github.com/Darshil103/nexora.git
cd nexora
./mvnw spring-boot:run
```

#### 3. Frontend Setup
```bash
cd frontend-react
npm install
npm run dev
```

### 🐳 Using Docker
You can also run the entire stack using Docker Compose:
```bash
docker-compose up --build
```

## 📄 License
This project is licensed under the MIT License.
