#!/bin/bash

echo "Starting CBL Sales Order Application..."
echo ""

echo "Installing dependencies..."
npm install
npm install concurrently --save-dev

echo ""
echo "Starting Backend and Frontend..."
npm run start:all
