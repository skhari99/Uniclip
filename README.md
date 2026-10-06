# UniClip 

A modern, real-time web application that allows users to instantly share and sync their clipboard text across multiple devices using unique room codes.

## Features

### Core
* **Real-Time Synchronization:** Instantly share clipboard text across connected devices using Supabase real-time WebSocket subscriptions.
* **Room-Based Architecture:** Create or join temporarysessions using a 4-digit code.
* **No Complex Setup:** Just enter a display name, create a room, and start sharing.
* **Active Device Tracking:** View a live list of connected devices and users within the same room.
* **Duplicate Prevention:** Robust client-side and subscription handling to prevent duplicate entries.
* **Human-Readable Timestamps:** Automatically formatted time displays.


## Tech Stack

* **Frontend:**
  * React.js
  * Tailwind CSS
  * Vite
* **Backend & Database:**
  * Supabase (PostgreSQL, Real-Time Channels)

## Preview

* **Landing View:** 
  * Simple interface to enter a display name and create or join a room via a 4-digit code.
* **Room View:** 
  * Displays synced clips with timestamps, delete functionality, and a real-time active devices panel.

## Video Demo

* [Click to View](https://drive.google.com/file/d/1uPxT14Btyk5vC05YRXwDO2Guk3NzXafk/view?usp=sharing)
