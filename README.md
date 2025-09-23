# Language Learning Workbench

A comprehensive language learning application that helps users learn languages through YouTube videos with interactive subtitles.

## Subtitle Functionality

This application supports multiple ways to add subtitles to videos:

### 1. File Upload

You can upload subtitle files in the following formats:
- **SRT** (SubRip Text) - The most common subtitle format with timing information
- **VTT** (Web Video Text Tracks) - Used for HTML5 videos
- **TXT** - Simple text files with one subtitle per line (timing will be estimated)

### 2. YouTube Captions

The application attempts to fetch captions directly from YouTube when available. This requires:
- The video must have captions in the selected language
- YouTube API access (if not available, mock subtitles will be used)

### 3. Demo Subtitles

For testing purposes, you can generate sample subtitles to see how the application works.

### 4. Manual Creation

You can also create subtitles manually using the built-in subtitle editor.

## Advanced Subtitle Editor

The application includes a powerful subtitle editor inspired by Subtitle Edit with features like:

### Timeline Visualization
- Visual timeline showing all subtitles
- Click on timeline to navigate to specific points
- Zoom in/out for precise editing

### Synchronization Tools
- Shift all subtitles forward or backward
- Adjust subtitle speed (stretch or compress timing)
- Set synchronization reference point

### Text Editing
- Merge adjacent subtitles
- Split subtitles at cursor position
- Search and replace across all subtitles

### Error Correction
- Remove hearing impaired text (text in brackets, parentheses)
- Fix common errors (multiple spaces, dots, dashes)
- Fix capitalization (first letter, after periods)
- Fix spacing around punctuation
- Remove line breaks

### Translation Support
- Translate individual subtitles
- Batch translate all subtitles

## Working with Subtitles

Once subtitles are loaded, you can:
- Click on words to see definitions and translations
- Loop specific subtitle segments for practice
- Adjust playback speed
- Toggle subtitle translations
- Edit subtitles in the subtitle editor

## Technical Notes

- The application uses the YouTube IFrame API to play videos
- Subtitle parsing is done client-side for SRT, VTT, and TXT files
- The YouTube Captions API requires OAuth 2.0 authentication for full access

