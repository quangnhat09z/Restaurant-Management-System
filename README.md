
# Restaurant Management System

## Overview
The Restaurant Management System is a full-stack application designed to manage restaurant operations efficiently. It includes features for handling orders, managing the menu, and processing payments.

## Features
- **Order Management**: Place, update, and track orders.
- **Menu Management**: Add, update, or remove menu items.
- **Payment Processing**: Manage customer payments securely.

## Technologies Used
### Frontend
- React
- Vite
- TailwindCSS
- Axios

### Backend
- Node.js
- Express
- MySQL

### Database
- SQL

## Installation and Setup

### Prerequisites
- Node.js
- npm (Node Package Manager)
- MySQL

### Database Setup

Import the SQL database files located in the **_init.txt_** directory into your MySQL server.
Chage DEV_USER = YOUR_NAME

### Backend Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/quangnhat09z/Restaurant-Management-System.git
   cd Restaurant-Management-System/services
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the backend server:
   ```sh 
   npm run start:all
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```sh
   cd ../Frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend server:
   ```sh
   npm run dev
   ```

## Usage
Once both servers are running, you can access the application at `http://localhost:3000` (or the port you configured).

## Contributions
Contributions are welcome! Please fork the repository and create a pull request for any improvements or bug fixes. Please refer to **CONTRIBUTING.md** before submitting a pull request.
## Contact
For any questions or feedback, please reach out to **ayushtiwari578@gmail.com**
