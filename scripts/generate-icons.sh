#!/bin/bash

# Create directory if it doesn't exist
mkdir -p scripts

# Generate favicon.ico
convert public/logo.svg -resize 64x64 public/favicon.ico

# Generate PNG icons
convert public/logo.svg -resize 192x192 public/logo192.png
convert public/logo.svg -resize 512x512 public/logo512.png 