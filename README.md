# Skyrim Map Navigation Application

## Overview

This project is a fullstack application designed to fetch and display maps, calculate routes between cities, and provide a user-friendly interface for navigation, developed using MERN Stack.
## Features

### Backend
- Saves map data in a database.
- Calculates shortest routes between cities.
- Exposes route calculation via API.

### Frontend
- Fetches map data from the backend and displays the map.
- Allows users to select start and destination points and get the shortest and fastest route.


## Getting Started
 **Clone the repository:**
   ```bash
   git clone https://code.fbi.h-da.de/bpse-sose24/group-4.git
```
## Quick Start from root directory

### Dependency Management of the Application with "one click"
**From the root Folder**
- **Install All Dependencies:** Install all dependencies with one click using `npm run install:all`.
- **Install Dependencies Frontend only:** Install all dependencies for Frontend only with one click using `npm run install:frontend`.
- **Install Dependencies Backend only:** Install all dependencies for Backend only with one click using `npm run install:backend`.
- **Remove All Dependencies:** Remove all dependencies with one click using `npm run remove:all`.
- **Remove Dependencies for Frontend only:** Remove all dependencies for Frontend only with one click using `npm run remove:frontend`.
- **Remove Dependencies for Backend only:** Remove all dependencies for Backend only with one click using `npm run remove:backend`.
- **Start Application:** Start the app and its dependencies with one click using `npm start`.
- **Start only the Frontend (after you have installed the Dependencies):** Start the Frontend only and its dependencies with one click using `npm run start:frontend`.
- **Start only the Backend (after you have installed the Dependencies):** Start the Backend only and its dependencies with one click using `npm run start:backend`.

## Start everything with one click
**From the root Folder**
1. **Install All Dependencies:** Install all dependencies with one click using `npm run install:all`.
2. **Start Application:** Start the app and its dependencies with one click using `npm start`.

## Start each Frontend and Backend separately
### Frontend
```bash
cd Frontend_React
npm install
npm start
```
or from the root folder
```bash
npm run start:frontend
```
### Backend
```bash
cd backend
npm install
npm start
```
or from the root folder
```bash
npm run start:backend
```
## Test
**Install the dependencies first with ```npm install```**
### Unit Test with JTest
```bash
cd backend
npm test
```
### Lint Test
```bash
cd backend
npm run lint
```

## CI/CD Pipeline

### Stages
1. **Build:** Compile the application code.
2. **Analyze:** Perform linting and static code analysis.
3. **Test:** Run unit tests.
4. **Deploy:** Deploy the application automatically after a release is triggered.

### CI/CD Features
- **Automated Tests:** Ensures that all tests run automatically on each commit.
- **Linting/Formatting:** Code is automatically linted and formatted to maintain code quality.
- **Static Code Checks:** Static analysis to detect potential issues early.
- **Automated Deployment:** Once a release is triggered on main, the application is deployed with no further manual steps required.
- **Dependency Updates:** Uses renovate to keep dependencies up-to-date.

