// 1. Load the YouTube IFrame Player API asynchronously
// This creates a <script> tag that loads the YouTube API.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// This array will store all initialized YouTube player objects
var youtubePlayers = [];

// This function is called automatically by the YouTube IFrame Player API once it's ready.
function onYouTubeIframeAPIReady() {
    // Select all iframe elements that have an ID starting with "youtube-player-"
    const youtubeIframes = document.querySelectorAll('iframe[id^="youtube-player-"]');

    youtubeIframes.forEach(iframe => {
        // Create a new YT.Player object for each iframe.
        // The first argument is the ID of the <iframe> element.
        const player = new YT.Player(iframe.id, {
            events: {
                // Attach an event listener for player state changes (e.g., playing, paused)
                'onStateChange': onPlayerStateChange
            },
            playerVars: {
                'autoplay': 0, // Ensure videos do not autoplay when the page loads
                'controls': 1, // Show player controls
                'rel': 0,      // Prevent showing related videos at the end
                'showinfo': 0, // Hide video title and uploader info
                'modestbranding': 1 // Remove YouTube logo from controls
            }
        });
        youtubePlayers.push(player); // Add the created player object to our array
    });
}

// This function is called whenever a YouTube player's state changes.
function onPlayerStateChange(event) {
    // YT.PlayerState.PLAYING (value 1) indicates the video has started playing.
    if (event.data === YT.PlayerState.PLAYING) {
        // When a YouTube video starts playing, pause all other media items.
        // `event.target` refers to the YT.Player object that just started playing.
        pauseAllMediaExcept(event.target);
    }
}

// This function pauses all media elements (local audio/video and YouTube videos)
// except for the one that triggered the play event.
function pauseAllMediaExcept(playingElement) {
    // First, handle all local <audio> and <video> elements.
    const localMediaElements = document.querySelectorAll('video, audio');
    localMediaElements.forEach(element => {
        // If the current local element is not the one that just started playing
        // AND it is currently playing (not paused), then pause it.
        if (element !== playingElement && !element.paused) {
            element.pause();
        }
    });

    // Next, handle all YouTube players.
    youtubePlayers.forEach(player => {
        // Check if the current YouTube player in the loop is NOT the one that just started playing.
        // Also check if it's currently playing (state 1) or buffering (state 3).
        if (player !== playingElement &&
            (player.getPlayerState() === YT.PlayerState.PLAYING ||
             player.getPlayerState() === YT.PlayerState.BUFFERING)) {
            player.pauseVideo(); // Use the YouTube API's method to pause the video.
        }
    });
}

// Add event listeners for local audio/video elements.
// This ensures that when a local audio/video starts, it pauses everything else.
document.addEventListener('DOMContentLoaded', () => {
    const localMediaElements = document.querySelectorAll('video, audio');
    localMediaElements.forEach(element => {
        element.addEventListener('play', () => {
            // When a local audio/video starts playing, pause all other media.
            // `element` refers to the native HTML audio/video element that just started playing.
            pauseAllMediaExcept(element);
        });
    });
});
