const games = [
    { title: "Candy Crush", folder: "01-Candy-Crush-Game", category: "Puzzle" },
    { title: "Archery", folder: "02-Archery-Game", category: "Action" },

    { title: "Breakout", folder: "04-Breakout-Game", category: "Retro" },
    { title: "Minesweeper", folder: "05-Minesweeper-Game", category: "Puzzle" },
    { title: "Tower Blocks", folder: "06-Tower-Blocks", category: "Action" },
    { title: "Ping Pong", folder: "07-Ping-Pong-Game", category: "Retro" },
    { title: "Tetris", folder: "08-Tetris-Game", category: "Retro" },
    { title: "Tilting Maze", folder: "09-Tilting-Maze-Game", category: "Puzzle" },
    { title: "Memory Card", folder: "10-Memory-Card-Game", category: "Puzzle" },
    { title: "Rock Paper Scissors", folder: "11-Rock-Paper-Scissors", category: "Action" },
    { title: "Type Number Guessing", folder: "12-Type-Number-Guessing-Game", category: "Puzzle" },
    { title: "Tic Tac Toe", folder: "13-Tic-Tac-Toe", category: "Retro" },
    { title: "Snake", folder: "14-Snake-Game", category: "Retro" },
    { title: "Connect Four", folder: "15-Connect-Four-Game", category: "Retro" },

    { title: "Typing Game", folder: "17-Typing-Game", category: "Puzzle" },

    { title: "Crossy Road", folder: "20-Crossy-Road-Game", category: "Action" },
    { title: "2048", folder: "21-2048-Game", category: "Puzzle" },

    { title: "Emoji Catcher", folder: "28-Emoji-Catcher-Game", category: "Action" },
    { title: "Whack A Mole", folder: "29-Whack-A-Mole-Game", category: "Retro" },
    { title: "Simon Says", folder: "30-Simon-Says-Game", category: "Retro" }
];

const gameGrid = document.getElementById('game-grid');
const gameSearch = document.getElementById('gameSearch');
const gameModal = document.getElementById('gameModal');
const gameFrame = document.getElementById('gameFrame');
const closeModal = document.querySelector('.close-modal');
const modalTitle = document.getElementById('modalGameTitle');
const filterPills = document.querySelectorAll('.pill');

// Initialize games
// Liked Games Logic
let likedGames = JSON.parse(localStorage.getItem('likedGames')) || [];

function saveLikedGames() {
    localStorage.setItem('likedGames', JSON.stringify(likedGames));
}

function toggleLike(event, gameTitle) {
    event.stopPropagation();
    const index = likedGames.indexOf(gameTitle);

    if (index === -1) {
        likedGames.push(gameTitle);
        // Visual update
        event.currentTarget.classList.add('liked');
    } else {
        likedGames.splice(index, 1);
        // Visual update
        event.currentTarget.classList.remove('liked');

        // If we are currently viewing the 'Liked' section, remove the card immediately
        if (document.getElementById('navLiked').classList.contains('active')) {
            const card = event.currentTarget.closest('.game-card');
            if (card) card.remove();
        }
    }
    saveLikedGames();
}

function displayGames(filteredGames) {
    gameGrid.innerHTML = '';
    filteredGames.forEach((game, index) => {
        const isLiked = likedGames.includes(game.title);
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <button class="like-button ${isLiked ? 'liked' : ''}" onclick="toggleLike(event, '${game.title}')">
                <svg class="heart-icon" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
            </button>
            <img src="Game/${game.folder.split('-')[0]}.png" onerror="this.onerror=null; this.src='https://picsum.photos/seed/${game.folder}/400/500'" alt="${game.title}" loading="lazy">
            <div class="game-info-overlay">
                <h3>${game.title}</h3>
                <p>${game.category}</p>
            </div>
        `;
        // Pass the game object to openGame, but only if the click wasn't on the button (handled by stopPropagation)
        card.onclick = (e) => {
            // Redundant check if stopPropagation works, but good for safety
            if (!e.target.closest('.like-button')) {
                openGame(game);
            }
        };
        gameGrid.appendChild(card);
    });
}

// User Stats & XP Logic
let userStats = {
    level: 1,
    xp: 0,
    nextLevelXP: 100
};

let playStartTime = null;
let xpInterval = null;

function loadStats() {
    const saved = localStorage.getItem('gameQuestStats');
    if (saved) {
        userStats = JSON.parse(saved);
        updateUIProgress();
    }
}

function saveStats() {
    localStorage.setItem('gameQuestStats', JSON.stringify(userStats));
}

function updateUIProgress() {
    document.getElementById('userLevel').textContent = userStats.level;
    document.getElementById('currentXP').textContent = Math.floor(userStats.xp);
    document.getElementById('nextLevelXP').textContent = userStats.nextLevelXP;
    const progress = (userStats.xp / userStats.nextLevelXP) * 100;
    document.getElementById('xpBar').style.width = `${progress}%`;
}

function addXP(amount) {
    userStats.xp += amount;
    if (userStats.xp >= userStats.nextLevelXP) {
        userStats.level++;
        userStats.xp -= userStats.nextLevelXP;
        userStats.nextLevelXP = Math.floor(userStats.nextLevelXP * 1.5);
        showLevelUpNotification();
    }
    updateUIProgress();
    saveStats();
}

function showLevelUpNotification() {
    const toast = document.createElement('div');
    toast.className = 'level-up-toast';
    toast.innerHTML = `🚀 LEVEL UP! You are now Level ${userStats.level}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function startXPGain() {
    playStartTime = Date.now();
    // Earn 1 XP every 2 seconds while playing
    xpInterval = setInterval(() => {
        addXP(1);
    }, 2000);
}

function stopXPGain() {
    clearInterval(xpInterval);
}

// Modal handling with XP gain
function openGame(game) {
    gameFrame.src = `Game/${game.folder}/index.html`;
    modalTitle.textContent = game.title;
    gameModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    startXPGain();
}

function closeGame() {
    gameModal.style.display = 'none';
    gameFrame.src = '';
    document.body.style.overflow = 'auto';
    stopXPGain();
    pauseMenu.style.display = 'none'; // Ensure menu is reset
}

function toggleFullscreen() {
    const gameContainer = document.getElementById('game-container');
    if (!document.fullscreenElement) {
        gameContainer.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Navigation Logic
const navHome = document.getElementById('navHome');
const navLiked = document.getElementById('navLiked');
const navNew = document.getElementById('navNew');

function setActiveNav(activeLink) {
    [navHome, navLiked, navNew].forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
}

navHome.onclick = (e) => {
    e.preventDefault();
    setActiveNav(navHome);
    displayGames(games);
    document.querySelector('.section-header h2').textContent = "All Games";
};

navLiked.onclick = (e) => {
    e.preventDefault();
    setActiveNav(navLiked);
    const likedGameObjects = games.filter(game => likedGames.includes(game.title));
    displayGames(likedGameObjects);
    document.querySelector('.section-header h2').textContent = "Liked Games";
};

navNew.onclick = (e) => {
    e.preventDefault();
    setActiveNav(navNew);
    // Placeholder for 'New' logic if needed, or just show all/random
    displayGames(games.slice(0, 5)); // Just showing first 5 as 'New' for example
    document.querySelector('.section-header h2').textContent = "New Games";
};

// Filter and Search Logic
function initFilters() {
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Remove active class from all
            filterPills.forEach(p => p.classList.remove('active'));
            // Add to clicked
            pill.classList.add('active');

            const category = pill.textContent;
            filterGames(category, gameSearch.value);

            // Ensure we are on the Home tab when filtering
            if (!navHome.classList.contains('active')) {
                setActiveNav(navHome);
                document.querySelector('.section-header h2').textContent = "All Games";
            }
        });
    });
}

function initSearch() {
    gameSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        const activeCategory = document.querySelector('.pill.active').textContent;
        filterGames(activeCategory, searchTerm);
    });
}

function filterGames(category, searchTerm) {
    searchTerm = searchTerm.toLowerCase();

    const filtered = games.filter(game => {
        const matchesCategory = category === 'All' || game.category === category;
        const matchesSearch = game.title.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

    displayGames(filtered);
}

// Pause Menu Logic
const pauseMenu = document.getElementById('pauseMenu');

function togglePauseMenu() {
    if (pauseMenu.style.display === 'flex') {
        resumeGame();
    } else {
        pauseMenu.style.display = 'flex';
        // Optional: If the game has a pause function exposed, call it here
        // search for 'pause' in iframe contentWindow if possible, but cross-origin might block it
    }
}

function resumeGame() {
    pauseMenu.style.display = 'none';
}

function restartGame() {
    if (gameFrame.src) {
        gameFrame.src = gameFrame.src; // Reloads the iframe
    }
    resumeGame(); // Hides the menu
}

function exitGame() {
    resumeGame(); // Hide menu
    if (document.fullscreenElement) {
        document.exitFullscreen().then(closeGame).catch(closeGame);
    } else {
        closeGame();
    }
}

// Close modal handlers
closeModal.onclick = closeGame;
window.onclick = (event) => {
    if (event.target == gameModal) {
        closeGame();
    }
};

// Initial load
window.onload = () => {
    loadStats();
    initFilters();
    initSearch();
    setTimeout(() => {
        displayGames(games);
    }, 800);
};
