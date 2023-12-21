# Karpo
<div align='center'>
<img width="419" alt="logo" src="https://drive.google.com/uc?id=1qg1EbdkCoM_RzpfVK7xKs7cx8ZZuc6Ok">
</div>


## Introduction

**Karpo** is a mobile app developed as a term project for the "Cloud Native Application Development" course at National Taiwan University in Autumn 2023. The purpose of Karpo is to provide a carpooling platform, connecting users who share similar routes to optimize transportation efficiency and minimizing environmental impact. The app is built with a React Native frontend and a Python backend, providing a seamless and responsive user experience.

<div align='center'>
    <img height="370" alt="" src="https://drive.google.com/uc?id=1YmlHuPtZ5NGYVPYAw8YDWo0a49y2c8z3" />
    <img height="370" alt="" src="https://drive.google.com/uc?id=1-fq03B4OZJI9sEJvM0NzF6iELuNESDHX" />
    <img height="370" alt="" src="https://drive.google.com/uc?id=1D83HKSydSAnME42OQ098u4MNYqH1HCw0" />
    <img height="370" alt="" src="https://drive.google.com/uc?id=1QLBKgKXRrLax9qporj4jYnL3UbJudtaH" />
</div>


## Features

- **User Authentication:** Secure user accounts with authentication and authorization mechanisms.
- **Carpool Creation:** Users can create carpools, specifying details such as pick-up and drop-off locations, time, and date.
- **Carpool Matching:** Intelligent algorithm matches users with similar routes, facilitating efficient carpooling.
- **Real-time Updates:** Users receive real-time updates on their carpools, including notifications and in-app messaging.
- **Rating and Reviews:** Rate and review fellow carpoolers to build a trustworthy community.
- **Responsive Design:** Mobile-friendly UI for a smooth experience on various devices.

## Prerequisites

Before you begin, ensure you have the following prerequisites:

- Node.js and npm
- Python
- Docker

## Installation
Clone the repository:
```bash
git clone https://github.com/kaienlin/karpo.git
cd karpo
```

### Frontend
1. Navigate to the frontend directory
    ```bash
    cd frontend
    ```
2. Install dependencies:
    ```bash
    yarn
    ```
3. Start the development server
    ```bash
    yarn start
    ```
For more details, refer to the [Frontend README](https://github.com/kaienlin/karpo/blob/master/frontend/README.md).


### Backend
1. Navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Build the docker image:
    ```bash
    make build-dev
    ```
3. Start the containers
    ```bash
    make docker-up
    ```
For more details, refer to the [Backend README](https://github.com/kaienlin/karpo/blob/master/backend/README.md).

## Acknowledgments
