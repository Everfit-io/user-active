### Run script sync data to google sheet
[![Daily Cron Job](https://github.com/Everfit-io/user-active/actions/workflows/daily_cronjob.yaml/badge.svg?branch=main&event=schedule)](https://github.com/Everfit-io/user-active/actions/workflows/daily_cronjob.yaml)

 - Set env for GOOGLE_SHEET_EMAIL
 - Set env for GOOGLE_SHEET_ID
 - Contact teammates to get service account file and paste it into sheet/service-account.json

### Set env

 - Install GitHub CLI: https://cli.github.com/
 - Login `gh`
 ```bash
 gh auth login
 ```
 - Set env:
 ```bash
 # Via .env file
 gh secret set -f .env

 # Set SERVICE_ACCOUNT via file
 gh secret set SERVICE_ACCOUNT < ./sheet/service-account.json
 ```
