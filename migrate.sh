#!/bin/bash
cd /Users/cristianjanz/radio-back
npx prisma migrate dev --name add-extended-station-info
npx prisma generate