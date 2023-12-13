
Create a `.env` file with the following
```env
BACKEND_API_URL=...
GOOGLE_MAPS_API_KEY=...
MAPS_SDK_IOS_API_KEY=...
MAPS_SDK_ANDROID_API_KEY=...
```

### Build
```bash
export $(xargs < .env)
eas build -p ios --profile preview
```

### Run e2e test
```bash
detox test -c ios.sim
```