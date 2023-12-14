# Karpo frontend


## Getting Started
### Prerequisites
- [yarn](https://yarnpkg.com)

### Installation
1. Clone the repo
    ```bash
    git clone https://github.com/kaienlin/karpo.git
    cd frontend
    ```
2. Install NPM packages
    ```bash
    yarn
    ```
3. Create a `.env` file with the following entries
    ```env
    BACKEND_API_URL=...
    GOOGLE_MAPS_API_KEY=...
    MAPS_SDK_IOS_API_KEY=...
    MAPS_SDK_ANDROID_API_KEY=...
    ```

### Run with Expo Go
```
yarn start
```

### Build
- Build on local machine
  ```bash
  yarn build-ios
  yarn build-android
  ```
- Build on EAS
  ```bash
  yarn build-all
  ```

### Run e2e test
```bash
yarn e2e:run
```