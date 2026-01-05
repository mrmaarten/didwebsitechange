# Website Change Detector

Monitors a website for changes and sends email notifications when content changes.

## Setup

### 1. Install Node.js (if not installed)

```bash
# Using Homebrew (recommended for macOS)
brew install node

# Or download from https://nodejs.org/
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure email notifications

```bash
# Copy the example config
cp env.example .env

# Edit .env with your email settings
nano .env
```

#### Gmail Setup

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → App passwords
3. Generate an app password for "Mail"
4. Use that app password in `.env` as `EMAIL_PASSWORD`

### 4. Test email configuration

Before running the monitor, test that your email setup works:

```bash
npm run test-email
```

You should receive a test email at the address specified in `EMAIL_TO`. If you see an error, double-check your `.env` configuration.

## Usage

### Run manually

```bash
npm run check
```

### First run

The first run creates a snapshot of the website:

```
[2024-01-05T10:00:00.000Z] Checking website...
Fetching https://www.example.com...
📸 First run - saving initial snapshot
```

### Subsequent runs

```
[2024-01-05T11:00:00.000Z] Checking website...
Fetching https://www.example.com...
✅ No changes detected
```

Or if changed:

```
[2024-01-05T11:00:00.000Z] Checking website...
Fetching https://www.example.com...
🔔 Website changed!
📧 Email sent to your-email@gmail.com
```

## Automatic Daily Checks (Cron)

### Option A: Using cron

```bash
# Edit crontab
crontab -e

# Add this line to run daily at 9am:
0 9 * * * didwebsitechange/run.sh
```

### Option B: Using macOS launchd

Create `~/Library/LaunchAgents/nl.websitecheck.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>nl.websitecheck</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/maarten/git_maybe_removed/didwebsitechange/run.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/Users/maarten/git_maybe_removed/didwebsitechange/launchd.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/maarten/git_maybe_removed/didwebsitechange/launchd.log</string>
</dict>
</plist>
```

Then load it:

```bash
launchctl load ~/Library/LaunchAgents/nl.websitecheck.plist
```

## Files

- `check-website.js` - Main script
- `test-email.js` - Test email configuration
- `run.sh` - Wrapper script for cron (loads .env)
- `.env` - Your email configuration (not in git)
- `env.example` - Example configuration
- `last-hash.txt` - Stored hash of last check (not in git)
- `last-content.txt` - Stored content of last check (not in git)
- `check-website.log` - Log file from cron runs (not in git)

## Customization

To monitor a different website, set `WATCH_URL` in `.env`:

```bash
WATCH_URL=https://example.com/page-to-watch
```
