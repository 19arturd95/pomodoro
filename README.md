# Pomodoro

This repository contains a simple Pomodoro timer extension for [Raycast](https://raycast.com).  
It lets you configure your focus duration, break duration and number of rounds, and provides notifications when each phase completes.

## Features

- Set custom **focus time**, **break time** and **number of rounds**.
- Receive toast and HUD notifications at the end of each focus and break phase.
- See the remaining time and current round if you keep the command window open.
- Commands for starting, stopping and resetting the timer.

## Installation

Raycast for Windows does not currently expose a local developer mode, so to use this extension you need to publish it as an **unlisted** extension and then install it via the generated link.  
The steps below outline the process:

1. Fork or push this repository to your own GitHub account.
2. Sign in to the [Raycast Developer portal](https://developer.raycast.com).
3. Create a new extension and select **GitHub Repository** as the source.
4. Choose your fork of this repository and set visibility to **Unlisted**.
5. After the build completes, copy the installation link and open it in Raycast on your Windows machine.

Once installed, open Raycast and run the `Pomodoro` command. Fill in your desired focus duration, break duration and number of rounds, then start the timer. Toast and HUD notifications will guide you through each phase.

### Development

If you're working on this extension on macOS, Raycast can automatically detect and reload it when running in Developer Mode. To start developing:

```bash
npm install
npm run dev
```

The `dev` script runs the Raycast CLI to load your extension locally. On Windows you should follow the installation steps above.

## License

This project is provided for personal use under the MIT License. See the [LICENSE](LICENSE) file for details.