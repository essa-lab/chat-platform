# Chat Platform - NestJS

A real-time chat platform built with NestJs, supporting Authintication, profile management, public rooms, private 1:1 conversations, and WebSocket-based messaging.

---

## 🚀 Features

- **Public Chat Room** — Open conversation for all connected users.
- **Private Messaging** — Secure 1:1 chats between users.
- **Real-Time Updates** — Instant message delivery using Socket.IO.
- **Authentication** — JWE-based authentication.
- **REST API** — Manage users, messages, and Profile.
- **Scalable Architecture** — Modular, maintainable NestJS design.

---

## Tech Stack

- **Backend Framework**: NestJs
- **Real-Time Communication**: ScoketIo
- **Authentication**: JWE
- **Database**: Postgres
- **ORM/ODM**: Prisma
- **API Documentation**: Swagger

---

## Project Structure

```plaintext
src/
│
├── auth/           # Authentication  logic
├── chat/           # Chat module (public & private messaging)
├── common/         # global exception, responses body
├── users/          # User management module
├── profile/        # Profile management module
├── shared/         # (guard, jwe service and azura service)
├── app.module.ts   # Root application module
└── main.ts         # Entry point
```
---

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/essa-lab/chat-platform.git
cd chat-platform
npm install
```
2. **Create a .env file in the root directory and configure the following variables:**
```

DATABASE_URL=
AZURE_STORAGE_CONNECTION_STRING=
AZURE_CONTAINER_NAME=
AZURE_ACCOUNT_NAME=
AZURE_ACCOUNT_KEY=
```

3. **Run the application**
```
npm run start:dev

The API will be available at: http://localhost:3000
Swagger docs : http://localhost:3001/api-docs
```

---
## ChatGateway (WebSocket Real-Time Messaging)

The `ChatGateway` is the WebSocket entry point for handling real-time communication in the chat platform.  
It uses **Socket.IO** with a dedicated `chat` namespace to manage both **public** and **private** conversations.

### Responsibilities
- **Connection Authentication**  
  - Extracts and verifies a JWE (JSON Web Encryption) token from the client's handshake (auth or `Authorization` header).
  - Disconnects clients with invalid or missing tokens.
  - Attaches authenticated user data to the socket connection.

- **Public Chat Room Management**  
  - Automatically joins authenticated users to the `public_room`.
  - Handles broadcasting of public messages and images to all connected users.

- **Private Messaging**  
  - Generates a unique private room name for any two users (`<id1>_<id2>` sorted).
  - Handles joining of private rooms and sending of private messages or images.

- **Image Sending**  
  - Supports both public and private image sharing through WebSocket events.

- **Lifecycle Events**  
  - `handleConnection()` — Validates and registers a new WebSocket client.
  - `handleDisconnect()` — Cleans up when a client disconnects.

### Supported WebSocket Events

| Event Name          | Direction      | Payload Example                                                 | Description                           |
|---------------------|---------------|-----------------------------------------------------------------|---------------------------------------|
| `public_message`    | Client → Server | `"Hello everyone!"`                                             | Send a message to all users in `public_room`. |
| `public_message`    | Server → Client | `{ "sender": 1, "message": "Hello everyone!" }`                 | Broadcast of a public message.        |
| `join_room`         | Client → Server | `{ "recipientId": 2 }`                                          | Join a private room with another user.|
| `private_message`   | Client → Server | `{ "recipientId": 2, "message": "Hey!" }`                       | Send a private message to a specific user. |
| `private_message`   | Server → Client | `{ "senderId": 1, "message": "Hey!" }`                          | Broadcast of a private message.       |
| `send_image`        | Client → Server | `{ "imageUrl": "https://img.com/pic.jpg" }` (public) or `{ "recipientId": 2, "imageUrl": "..." }` | Send an image to public or private chat. |
| `image_sent`        | Server → Client | `{ "senderId": 1, "message": "https://img.com/pic.jpg" }`       | Broadcast of an image message.        |

### Authentication Flow
1. Client sends a connection request with `auth.token` or `Authorization` header.
2. The `JweService` decrypts and verifies the token payload.
3. On success, the user is registered in the WebSocket context and joined to `public_room`.
4. On failure, the connection is terminated.

### Room Naming Strategy

Private chat rooms are named using both participants’ IDs in ascending order, separated by an underscore:  
Example:  User 5 and User 2 → "2_5"

---

**Module Location:** `src/chat/chat.gateway.ts`  
**Dependencies:**  
- `JweService` — Decrypts & verifies JWT/JWE tokens.  
- `ChatService` — Persists chat messages to the database.  
- `Socket.IO` — Real-time WebSocket communication.


---

## 🏛 Architecture Overview

The application follows **NestJS’s modular architecture**, ensuring scalability, maintainability, and separation of concerns.  
Each feature is implemented as an isolated module with its own controllers, services, and providers.  

### Core Modules

- **SharedModule** (`src/common/`)
  - **Global module** that provides common services and utilities across the application.
  - **Services Provided**:
    - `PrismaService` — Database access layer using Prisma ORM.
    - `JweService` — Handles JSON Web Encryption (JWE) token creation, decryption, and validation.
    - `AzureStorageService` — Manages file uploads and storage on Azure.
    - `JweAuthGuard` — Global authentication guard protecting routes and WebSocket connections.
  - Exported so other modules can directly inject these shared services.

- **UserModule** (`src/users/`)
  - Handles user management operations (CRUD, queries, etc.).
  - **UserController** — Exposes REST API endpoints for user-related operations.
  - **UserService** — Business logic for managing user data.

- **ChatModule** (`src/chat/`)
  - Manages both **public** and **private** chat messaging.
  - **ChatController** — Optional REST endpoints for retrieving chat history or managing chat settings.
  - **ChatGateway** — WebSocket gateway for real-time communication (public messages, private messages, image sharing).
  - **ChatService** — Persists chat messages to the database and retrieves chat data.

- **ProfileModule** (`src/profile/`)
  - Manages user profile information and updates.
  - **ProfileController** — REST API for profile-related operations.
  - **ProfileService** — Profile business logic (retrieval, update, avatar changes).
  - Reuses **UserService** from `UserModule` for user data consistency.

---

### Architectural Characteristics

- **Global Shared Services** — Core utilities like authentication, encryption, and database access are provided via the `SharedModule` and available everywhere.
- **Separation of Concerns** — Each module encapsulates its own logic, preventing cross-module coupling.
- **Real-Time Communication Layer** — `ChatGateway` uses Socket.IO for instant message delivery while integrating with authentication via `JweService`.
- **Security** — JWE-based authentication applied globally to protect both HTTP and WebSocket endpoints.
- **Scalable Design** — Modular structure allows adding more features (e.g., notifications, groups, file sharing) without affecting existing functionality.

