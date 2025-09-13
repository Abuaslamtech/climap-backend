# Climap Backend

<div align="center">

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

**A robust RESTful API for healthcare facility management**

[Features](#features) • [Installation](#installation) • [API Documentation](#api-endpoints) • [Contributing](#contributing)

</div>

---

## 🚀 Overview

Climap Backend is a **NestJS-powered RESTful API** designed for comprehensive healthcare facility management. Built with **Prisma ORM** and **PostgreSQL**, it provides secure, scalable access to facility data with user submission workflows, advanced filtering capabilities, and efficient cursor-based pagination.

### 🎯 Key Highlights

- **User-Friendly Submissions**: Healthcare facilities submitted by users are marked as pending for administrative verification
- **Advanced Filtering**: Filter facilities by state, LGA, facility type, and ownership
- **Efficient Pagination**: Cursor-based pagination for optimal performance with large datasets
- **Secure Authentication**: JWT-based authentication protecting administrative routes
- **Input Validation**: Comprehensive validation using DTOs with `class-validator`

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏥 **Facility Management** | Complete CRUD operations for healthcare facilities |
| 📝 **User Submissions** | User-submitted facilities with pending verification workflow |
| 🔍 **Advanced Filtering** | Filter by state, LGA, facility type, and ownership |
| 📄 **Cursor Pagination** | Efficient data retrieval for large datasets |
| ✅ **Input Validation** | Robust validation using DTOs and `class-validator` |
| 🗄️ **Database Integration** | PostgreSQL with Prisma ORM for type-safe database access |
| 🔐 **JWT Authentication** | Secure authentication for protected administrative routes |

---

## 🛠️ Technology Stack

<table>
<tr>
<td>

**Backend Framework**
- [NestJS](https://nestjs.com/) - Scalable Node.js framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript

</td>
<td>

**Database & ORM**
- [PostgreSQL](https://www.postgresql.org/) - Robust relational database
- [Prisma ORM](https://www.prisma.io/) - Next-generation TypeScript ORM

</td>
</tr>
<tr>
<td>

**Validation & Security**
- [class-validator](https://github.com/typestack/class-validator) - Decorator-based validation
- [JWT](https://jwt.io/) - JSON Web Token authentication

</td>
<td>

**Development Tools**
- [class-transformer](https://github.com/typestack/class-transformer) - Object transformation
- [ESLint](https://eslint.org/) - Code linting and formatting

</td>
</tr>
</table>

---

## 📦 Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/climap-backend.git
   cd climap-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # Application Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   npx prisma migrate dev
   
   # Generate Prisma client
   npx prisma generate
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build && npm run start:prod
   ```

🎉 **Your API is now running at** `http://localhost:3000`

---

## 📚 API Endpoints

### 🏥 Facilities

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/facilities/add` | Submit a new facility (pending status) | ❌ |
| `GET` | `/facilities` | Get facilities with filters & pagination | ❌ |
| `GET` | `/facilities/:id` | Get facility details | ❌ |
| `PATCH` | `/facilities/:id` | Update facility details | ✅ |
| `PATCH` | `/facilities/:id/approve` | Approve pending facility | ✅ Admin |
| `DELETE` | `/facilities/:id` | Delete facility | ✅ Admin |

### 🔍 Query Parameters for `/facilities`

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `state` | string | Filter by state | `?state=Lagos` |
| `lga` | string | Filter by Local Government Area | `?lga=Ikeja` |
| `facilityType` | string | Filter by facility type | `?facilityType=Hospital` |
| `ownership` | string | Filter by ownership type | `?ownership=Private` |
| `next` | string | Cursor for pagination | `?next=eyJpZCI6IjEyMyJ9` |
| `pageSize` | number | Number of results per page (max: 50) | `?pageSize=20` |

### 📝 Example Requests

**Get facilities with filters:**
```bash
curl -X GET "http://localhost:3000/facilities?state=Lagos&facilityType=Hospital&pageSize=10"
```

**Submit a new facility:**
```bash
curl -X POST "http://localhost:3000/facilities/add" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lagos General Hospital",
    "state": "Lagos",
    "lga": "Lagos Island",
    "facilityType": "Hospital",
    "ownership": "Public"
  }'
```

---

## 🔄 Data Flow

```mermaid
graph LR
    A[User Submits Facility] --> B[Status: Pending]
    B --> C[Admin Review]
    C --> D[Status: Verified]
    D --> E[Visible to All Users]
    
    F[API Request] --> G[Apply Filters]
    G --> H[Cursor Pagination]
    H --> I[Return Results]
```

1. **User Submission**: Users submit healthcare facilities → automatically marked as `Pending`
2. **Admin Verification**: Administrators review and approve → status updated to `Verified`
3. **Public Access**: Verified facilities become visible through public API endpoints
4. **Efficient Retrieval**: Advanced filtering and cursor-based pagination for optimal performance

---

## 🧪 Testing

### Using Postman

1. **Import Collection**: Import the API endpoints into Postman
2. **Environment Variables**: Set up environment with `baseUrl = http://localhost:3000`
3. **Test Authentication**: For protected routes, include JWT token in headers

### Example Test Requests

```bash
# Get all facilities
GET {{baseUrl}}/facilities

# Get facilities with filters
GET {{baseUrl}}/facilities?state=Lagos&facilityType=Hospital&pageSize=10

# Paginated request (use 'next' from previous response)
GET {{baseUrl}}/facilities?next=eyJpZCI6IjEyMyJ9&pageSize=10
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Standards

- Follow **TypeScript** best practices
- Use **ESLint** configuration provided
- Write **descriptive commit messages**
- Add **tests** for new features
- Update **documentation** as needed

### Development Setup

```bash
# Install dependencies
npm install

# Run in development mode with hot reload
npm run start:dev

# Run tests
npm run test

# Lint code
npm run lint
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

<div align="center">

**Need help or have questions?**

[![GitHub Issues](https://img.shields.io/badge/GitHub-Issues-red?style=for-the-badge&logo=github)](https://github.com/yourusername/climap-backend/issues)
[![Email](https://img.shields.io/badge/Email-Contact-blue?style=for-the-badge&logo=gmail)](mailto:your-email@example.com)

**Maintainer:** [Your Name](https://github.com/yourusername)

</div>

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ for the healthcare community

</div>