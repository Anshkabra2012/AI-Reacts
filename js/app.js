// Improve mobile responsiveness
document.addEventListener("touchstart", function(){}, {passive: true});
document.body.focus();

// Smooth Scroll to Section
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// Typewriter Effect (requires a library like Typewriter.js loaded via CDN)
document.addEventListener('DOMContentLoaded', function() {
  const typewriter = new Typewriter(document.getElementById('typewriter'), { loop: true, delay: 70 });
  typewriter.typeString('Your AI Reaction Generator')
    .pauseFor(1200)
    .deleteAll()
    .typeString('Get the Perfect Reaction')
    .pauseFor(1200)
    .deleteAll()
    .typeString('Share Your Moment with a Smile')
    .pauseFor(1200)
    .start();

  // Initialize AOS (Animate On Scroll) if needed
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
    });
  }

  // Initialize Tippy on donation button if needed
  if (typeof tippy !== 'undefined') {
    tippy('#donate-btn', {
      content: "Click here to donate via PayPal",
      placement: "top"
    });
  }
});

// API & Reaction Generator Functionality
// IMPORTANT: For public repositories, do NOT hard-code your API keys.
// Instead, use environment variables (with a build tool) or a secure server-side proxy.
// The keys below are for demonstration only.
const API_URL = 'https://gpt-4o-mini.ai.esb.is-a.dev/v1/chat/completions';
const AI_API_KEY = 'gpt-4o-mini';
const GIPHY_API_KEY = "FhjwoC7Vztg1GqDlP8xNp3A7XoTO4SrM";
const TENOR_API_KEY = "AIzaSyCyI9NQ1zXnFOdGSZG2NaHYjcwdVj4VVhw";

async function callChatAPI(messages) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AI_API_KEY}`
  };
  const body = { model: 'gpt-4o-mini', messages, stream: false };
  const response = await fetch(API_URL, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!response.ok) throw new Error('Error: ' + response.status + ' ' + response.statusText);
  const data = await response.json();
  return data.choices[0].message.content;
}

// Function to fetch a random GIF from Giphy based on a query.
async function getRandomGif(query) {
  const offset = Math.floor(Math.random() * 25); // Randomize offset for fresh results.
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=1&offset=${offset}`;
  const response = await fetch(url);
  const json = await response.json();
  if (json.data && json.data.length > 0) {
    return json.data[0].images.original.url;
  } else {
    return null;
  }
}

// Backup: Function to fetch a GIF from Tenor.
async function getTenorGif(query) {
  const url = `https://g.tenor.com/v1/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=1`;
  const response = await fetch(url);
  const json = await response.json();
  if (json.results && json.results.length > 0) {
    return json.results[0].media[0].gif.url;
  } else {
    return null;
  }
}

// Generate Reaction: Shorten prompt and fetch GIF.
async function generateReaction() {
  const userInput = document.getElementById('reaction-input').value.trim();
  const reactionBox = document.getElementById('reaction-box');

  if (!userInput) {
    reactionBox.innerHTML = '<p style="color:red;">Please describe your day!</p>';
    return;
  }

  reactionBox.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating your reaction...';

  try {
    // Call the AI to produce a two-line output:
    // Line 1: The witty reaction.
    // Line 2: A short (2-4 word) query for the GIF.
    const messages = [
      {
        role: "system",
        content: "You are an AI reaction generator. Given a user's description of their day or mood, respond with exactly two lines. Line 1 should be a witty, shareable reaction that captures the user's feeling. Line 2 should be a very short (2-4 word) query optimized for searching a relevant meme GIF."
      },
      { role: "user", content: userInput }
    ];
    const aiResponse = await callChatAPI(messages);
    const lines = aiResponse.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const reactionText = lines[0] || "Here's your reaction!";
    const shortQuery = lines[1] || "funny meme";

    // Fetch a random GIF based on the short query from Giphy.
    let gifUrl = await getRandomGif(shortQuery);

    // If no GIF is found, use Tenor as a backup.
    if (!gifUrl) {
      gifUrl = await getTenorGif(shortQuery);
    }

    if (gifUrl) {
      reactionBox.innerHTML = `<p><strong>Your Reaction:</strong> ${reactionText}</p>
                               <img src="${gifUrl}" alt="Reaction GIF">`;
    } else {
      reactionBox.innerHTML = `<p><strong>Your Reaction:</strong> ${reactionText}</p>
                               <p style="color:red;">No GIF found for the reaction.</p>`;
    }
  } catch (error) {
    reactionBox.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
  }
}

// Set up button click for generating reaction.
document.addEventListener('DOMContentLoaded', function() {
  const generateBtn = document.getElementById('generate-btn');
  generateBtn.addEventListener('click', generateReaction);
});

// Voice Input Feature
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById('reaction-input').value = transcript;
  };

  recognition.onerror = function(event) {
    console.error("Speech recognition error", event.error);
  };

  document.addEventListener('DOMContentLoaded', function() {
    const voiceBtn = document.getElementById('voice-btn');
    voiceBtn.addEventListener('click', function() {
      recognition.start();
    });
  });
} else {
  // If voice recognition is not supported, disable the button.
  document.getElementById('voice-btn').disabled = true;
  document.getElementById('voice-btn').innerText = "Voice Not Supported";
}

// Donation Function
function donate() {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: 'Support Our Work',
      text: "Would you like to donate via PayPal?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, donate!',
      cancelButtonText: 'No, thanks'
    }).then((result) => {
      if (result.isConfirmed) {
        window.open("https://paypal.me/anshkabra", "_blank");
      }
    });
  } else {
    window.open("https://paypal.me/anshkabra", "_blank");
  }
}
