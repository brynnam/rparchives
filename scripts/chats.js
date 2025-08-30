// 🔹 Profile pictures
const profilePics = {
  you: "../imgs/profile-you.png",
  partner: "../imgs/profile-partner.png"
};

// Set favicon dynamically for all pages
(function() {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png'; // or 'image/svg+xml' if you use an SVG
  link.href = '../imgs/heart.png'; // adjust path relative to each HTML file
  document.head.appendChild(link);
})();

// 🔹 Chat container
const chatEl = document.getElementById("chat");
const chatJsonFile = chatEl.dataset.json;

// 🔹 Generate or retrieve a unique user ID
let userId = localStorage.getItem('chatUserId');
if (!userId) {
  userId = Math.random().toString(36).substring(2, 10);
  localStorage.setItem('chatUserId', userId);
}

// 🔹 Scroll storage key: unique per chat + user
const scrollKey = `scroll_${chatJsonFile}_${userId}`;

// 🔹 Load chat JSON
async function loadChat() {
  try {
    const response = await fetch(`../rp jsons/${chatJsonFile}`);
    let messages = await response.json();

    // Reverse messages for proper order
    messages = messages.reverse();
    renderChat(messages);

    // Restore previous scroll position if available
    const savedScroll = localStorage.getItem(scrollKey);
    if (savedScroll) {
      chatEl.scrollTop = parseInt(savedScroll, 10);
    }
  } catch (err) {
    console.error("Failed to load chat JSON", err);
    chatEl.textContent = "Error loading chat.";
  }
}

// 🔹 Create message bubble
function createMessageBubble(message) {
  const row = document.createElement("div");
  row.className = "message-row " + (message.sender === "you" ? "you" : "partner");

  const profileImg = document.createElement("img");
  profileImg.className = "profile-pic";
  profileImg.src = profilePics[message.sender] || "";
  profileImg.alt = message.sender + " profile";

  const bubble = document.createElement("div");
  bubble.className = "bubble " + (message.sender === "you" ? "you" : "partner");

  if (message.text) {
    const textNode = document.createElement("div");
    textNode.textContent = message.text;
    bubble.appendChild(textNode);
  }

  if (message.img) {
    const imgNode = document.createElement("img");
    imgNode.src = message.img;
    imgNode.alt = "RP Image";
    bubble.appendChild(imgNode);
  }

  if (message.time) {
    const timeNode = document.createElement("div");
    timeNode.className = "msg-timestamp";
    timeNode.textContent = message.time;
    bubble.appendChild(timeNode);
  }

  row.appendChild(profileImg);
  row.appendChild(bubble);
  return row;
}

// 🔹 Render chat
function renderChat(messages) {
  chatEl.innerHTML = "";
  let lastDate = null;

  messages.forEach(message => {
    const dateObj = new Date(message.time);
    if (isNaN(dateObj)) return;

    const dateStr = dateObj.toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    if (dateStr !== lastDate) {
      const ts = document.createElement("div");
      ts.className = "timestamp";
      ts.textContent = dateStr;
      chatEl.appendChild(ts);
      lastDate = dateStr;
    }

    const messageRow = createMessageBubble({
      ...message,
      time: dateObj.toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})
    });

    chatEl.appendChild(messageRow);
  });
}

// 🔹 Back-to-top button
const topBtn = document.createElement('button');
topBtn.id = 'topButton';
topBtn.textContent = '⮸';
document.body.appendChild(topBtn);

chatEl.addEventListener('scroll', () => {
  // Show button after scrolling 200px
  if (chatEl.scrollTop > 200) {
    topBtn.classList.add('show');
  } else {
    topBtn.classList.remove('show');
  }

  // Save scroll position for this user + chat
  localStorage.setItem(scrollKey, chatEl.scrollTop);
});

topBtn.addEventListener('click', () => {
  chatEl.scrollTo({ top: 0, behavior: 'smooth' });
});

// 🔹 Dark/light mode
const toggleBtn = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('theme') || 'light';
document.body.classList.toggle('dark', currentTheme === 'dark');
toggleBtn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  toggleBtn.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// 🔹 Back button
const backBtn = document.getElementById('backButton');
backBtn.addEventListener('click', () => {
  window.location.href = '../index.html';
});

// 🔹 Load chat
loadChat();
