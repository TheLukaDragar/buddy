# Buddy

Welcome to your Expo app 👋

This is an [Expo](https://expo.io/) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## EAS Build & Updates + GitHub Workflows

This project is set up with both EAS Build for automated development builds and EAS Update for over-the-air updates with internal distribution.

### Setup

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure EAS Build** (already done):
   ```bash
   eas build:configure
   ```

### GitHub Secrets Setup

To enable automatic builds and updates via GitHub Actions, you need to set up the following secret in your repository:

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add a new repository secret:
   - **Name**: `EXPO_TOKEN`
   - **Value**: Your Expo access token (get it from https://expo.dev/settings/access-tokens)

### Build Profiles & Update Channels

- **development**: Development builds with expo-dev-client for internal distribution + development update channel
- **preview**: Production-like builds for internal testing + preview update channel  
- **production**: Store-ready builds for app store submission + production update channel

### Automatic Workflows

#### EAS Build (`.github/workflows/dev-build.yml`)
Triggers builds when:
- Code is pushed to `main`, `development`, or `dev` branches
- Pull requests are opened against `main` or `development` branches
- Manual workflow dispatch is triggered

#### EAS Update (`.github/workflows/eas-update.yml`)
Publishes over-the-air updates when:
- Code is pushed to tracked branches (auto-selects appropriate channel)
- Manual workflow dispatch with custom channel selection
- Pull requests (creates preview updates)

**Channel mapping:**
- `main` branch → `production` channel
- `development`/`dev` branches → `development` channel
- Pull requests → `preview` channel
- 

### Manual Commands

#### Build Commands
```bash
# Development build for internal distribution
eas build --platform all --profile development

# Preview build for internal testing
eas build --platform android --profile preview --local

# Production build for app stores
eas build --platform all --profile production
```

#### Update Commands
```bash
# Publish update to development channel
eas update --channel development --message "Development update"

# Publish update to preview channel
eas update --channel preview --message "Preview update"

# Publish update to production channel
eas update --channel production --message "Production update"
```

### Internal Distribution

Development and preview builds are configured for internal distribution, meaning:
- They can be installed directly on devices without going through app stores
- Android builds generate `.apk` files
- iOS builds use ad hoc provisioning for registered devices
- Build artifacts are available through the EAS dashboard with QR codes for easy installation

### Over-the-Air Updates

EAS Update allows you to push JavaScript and asset updates to your published builds without needing to rebuild:

- **Instant delivery**: Updates are delivered immediately to compatible builds
- **Rollback capability**: Easy rollback to previous versions if needed
- **Channel-based**: Different update channels for different environments
- **Automatic fallback**: Falls back to embedded bundle if update fails

### How It Works Together

1. **Development cycle**: Push code → Automatic EAS Update published → Existing builds get updated instantly
2. **New features**: When native changes are needed → Trigger EAS Build → New build with latest updates
3. **Release process**: Merge to main → Production update published → Users get updates automatically

For more information:
- [EAS Build documentation](https://docs.expo.dev/build/introduction/)
- [EAS Update documentation](https://docs.expo.dev/eas-update/introduction/)

# Trigger.dev

- [Trigger.dev documentation](https://trigger.dev/docs)

```bash
 npx trigger.dev@latest deploy
```

```bash
  supabase functions deploy                 
```

runs localy NOTE set secret in suapabase edge function secret TRIGGER_SECRET_KEY TO production or decelopment!
 ```bash
 npx trigger.dev@latest dev     
 ```

## Workout Plan Generation System

### Overview
We use **Trigger.dev** for long-running workout plan generation to avoid Supabase Edge Function timeouts.

### How It Works

1. **User Profile Generation** → User completes onboarding questionnaire
2. **Trigger Workout Plan** → App calls Supabase Edge Function `/trigger-workout-plan`
3. **Background Processing** → Trigger.dev receives the job and generates 8-week workout plan
4. **Real-time Updates** → User sees live status updates via Supabase Realtime
5. **Plan Ready** → Generated plan appears in the app automatically

### Architecture

```
User App → Supabase Edge Function → Trigger.dev → Database
    ↑                                                    ↓
    ←──────── Supabase Realtime Updates ←──────────────
```

### Key Components

- **`services/workoutPlanService.ts`** - Calls trigger endpoint
- **`trigger/workout-plan-generation.ts`** - Background job logic  
- **`store/api/enhancedApi.ts`** - Real-time subscriptions
- **`lib/realtimeClient.ts`** - WebSocket connection manager

### Real-time Tables

- `workout_plan_requests` - Job status tracking
- `workout_plans` - Generated plan metadata  
- `workout_entries` - Individual exercises per week





# NOTE DEPLOY

```bash
npx expo export --platform web
npx eas-cli deploy --prod
```