# Maestro E2E Tests

## Running Tests Locally

### Prerequisites

- Maestro CLI installed: `curl -Ls "https://get.maestro.mobile.dev" | bash`
- iOS Simulator or Android Emulator running
- App installed on device/simulator

### Run All Flows

```bash
maestro test .maestro/flows
```

### Run Specific Flow

```bash
maestro test .maestro/flows/00-smoke-test.yaml
```

### Record New Flow

```bash
maestro record
```

## Flows

- `00-smoke-test.yaml` - Basic app launch test

## Notes

- Flows are designed to be run against a clean app state
- Test accounts: (to be added when needed)
