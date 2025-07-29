# LaunchDarkly Wrapper Example

A React application demonstrating LaunchDarkly integration with:
- Custom LaunchDarkly wrapper with privacy controls
- Raw LaunchDarkly context display
- Network monitoring for events.launchdarkly.com with attribute obfuscation

## Setup

Rename `.env.example` to `.env` and replace the value with your client side id

```bash
VITE_LAUNCHDARKLY_CLIENT_SIDE_ID=your_client_side_id_here
```

## Run Instructions

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`
