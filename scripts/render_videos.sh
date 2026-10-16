#!/bin/bash
set -e

mkdir -p /tmp/video_work public

# 1. Generate clean synthesized audio track for Video 1 (Command Center)
ffmpeg -y -f lavfi -i "sine=frequency=440:duration=16" \
  -af "volume=0.2, tremolo=f=4:d=0.6" /tmp/video_work/ambient.wav

# Video 1: Desktop Web Command Center Walkthrough (16 seconds, 1080p, H.264)
ffmpeg -y \
  -loop 1 -t 4 -i src/assets/images/construction_safety_hero_1792117992203.jpg \
  -loop 1 -t 4 -i src/assets/images/aerodynamic_wind_tunnel_1792118019118.jpg \
  -loop 1 -t 4 -i src/assets/images/nanobanana_mitigation_engineering_1792124316759.jpg \
  -loop 1 -t 4 -i src/assets/images/nanobanana_mobile_patrol_1792124316883.jpg \
  -i /tmp/video_work/ambient.wav \
  -filter_complex "
    [0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,
         drawbox=y=ih-180:color=black@0.7:width=iw:height=180:t=fill,
         drawtext=text='SafeStack Weather Guard | Desktop Command Center Demo':fontsize=44:fontcolor=white:x=60:y=h-140,
         drawtext=text='Step 1. Live KMA Open API Weather Integration & 24h Predictive Trend':fontsize=26:fontcolor=0xF59E0B:x=60:y=h-70[v0];
    [1:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,
         drawbox=y=ih-180:color=black@0.7:width=iw:height=180:t=fill,
         drawtext=text='Real-Time 3D CFD Aerodynamic Wind Tunnel Analysis':fontsize=44:fontcolor=white:x=60:y=h-140,
         drawtext=text='Step 2. 5 Physics Engines - NASA Drag & Lift, Sliding, Toppling & Fall':fontsize=26:fontcolor=0x06B6D4:x=60:y=h-70[v1];
    [2:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,
         drawbox=y=ih-180:color=black@0.7:width=iw:height=180:t=fill,
         drawtext=text='Before vs. After Mitigation Simulation (What-If Engine)':fontsize=44:fontcolor=white:x=60:y=h-140,
         drawtext=text='Step 3. 2.5kN Ratchet Straps & Rubber Friction Pads (Delta FS Recalculation)':fontsize=26:fontcolor=0x10B981:x=60:y=h-70[v2];
    [3:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,
         drawbox=y=ih-180:color=black@0.7:width=iw:height=180:t=fill,
         drawtext=text='SafeStack Weather Guard | 100% Dual-Language System':fontsize=44:fontcolor=white:x=60:y=h-140,
         drawtext=text='Step 4. Full Verification & Nationwide Korean Construction Site Presets':fontsize=26:fontcolor=white:x=60:y=h-70[v3];
    [v0][v1][v2][v3]concat=n=4:v=1:a=0[vout]
  " \
  -map "[vout]" -map 4:a \
  -c:v libx264 -pix_fmt yuv420p -r 24 -c:a aac -shortest \
  public/SafeStack_Web_Command_Center_Demo.mp4

# Video 2: Mobile Field Patrol & QR Camera Walkthrough (16 seconds, 1080p, H.264)
ffmpeg -y \
  -loop 1 -t 4 -i src/assets/images/nanobanana_mobile_patrol_1792124316883.jpg \
  -loop 1 -t 4 -i src/assets/images/aerodynamic_wind_tunnel_1792118019118.jpg \
  -loop 1 -t 4 -i src/assets/images/nanobanana_mitigation_engineering_1792124316759.jpg \
  -loop 1 -t 4 -i src/assets/images/construction_safety_hero_1792117992203.jpg \
  -i /tmp/video_work/ambient.wav \
  -filter_complex "
    [0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,
         drawbox=y=ih-180:color=black@0.7:width=iw:height=180:t=fill,
         drawtext=text='SafeStack Weather Guard | Mobile Field Patrol Mode':fontsize=44:fontcolor=white:x=60:y=h-140,
         drawtext=text='Part 1. 1-Handed High-Contrast Field Cards & Sub-Second QR Camera Scan':fontsize=26:fontcolor=0xF59E0B:x=60:y=h-70[m0];
    [1:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,
         drawbox=y=ih-180:color=black@0.7:width=iw:height=180:t=fill,
         drawtext=text='Gemini 3.8 Flash AI Safety Patrol Assistant':fontsize=44:fontcolor=white:x=60:y=h-140,
         drawtext=text='Part 2. Urgent Danger QnA & Direct Target Yard Navigation':fontsize=26:fontcolor=0x06B6D4:x=60:y=h-70[m1];
    [2:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,
         drawbox=y=ih-180:color=black@0.7:width=iw:height=180:t=fill,
         drawtext=text='1-Tap Instant Ratchet Strapping & Physics Recalculation':fontsize=44:fontcolor=white:x=60:y=h-140,
         drawtext=text='Part 3. Real-Time Safety Factor Update (DANGER -> CHECK)':fontsize=26:fontcolor=0x10B981:x=60:y=h-70[m2];
    [3:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,
         drawbox=y=ih-180:color=black@0.7:width=iw:height=180:t=fill,
         drawtext=text='5-Entry Location Safety Maintenance History Log':fontsize=44:fontcolor=white:x=60:y=h-140,
         drawtext=text='Part 4. Persistent Inspection Audit Compliance for Site Supervisors':fontsize=26:fontcolor=white:x=60:y=h-70[m3];
    [m0][m1][m2][m3]concat=n=4:v=1:a=0[mout]
  " \
  -map "[mout]" -map 4:a \
  -c:v libx264 -pix_fmt yuv420p -r 24 -c:a aac -shortest \
  public/SafeStack_Mobile_Patrol_Demo.mp4

echo "Videos generated successfully!"
ls -lh public/*.mp4
