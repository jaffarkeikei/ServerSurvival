// Game State
const gameState = {
    score: 0,
    wave: 1,
    availableResources: 10,
    isGameOver: false,
    isPaused: false,
    serverHealth: 100,
    metrics: {
        cpu: 50,
        memory: 30,
        network: 20,
        errorRate: 5
    },
    autoHealEnabled: false,
    autoScaleEnabled: false,
    chaosEvents: [],
    currentChaosEvents: [],
    maxSimultaneousEvents: 3,
    waveTimer: null,
    difficultyMultiplier: 1,
    repairCosts: {
        cpu: 0,
        memory: 0,
        network: 0,
        errorRate: 0
    }
};

// References to DOM elements
const elements = {
    score: document.getElementById('score'),
    wave: document.getElementById('wave'),
    resources: document.getElementById('resources'),
    cpuBar: document.getElementById('cpu-bar'),
    cpuValue: document.getElementById('cpu-value'),
    memoryBar: document.getElementById('memory-bar'),
    memoryValue: document.getElementById('memory-value'),
    networkBar: document.getElementById('network-bar'),
    networkValue: document.getElementById('network-value'),
    errorBar: document.getElementById('error-bar'),
    errorValue: document.getElementById('error-value'),
    eventsContainer: document.getElementById('events-container'),
    gameCanvas: document.getElementById('gameCanvas'),
    gameOver: document.getElementById('gameOver'),
    finalScore: document.getElementById('final-score'),
    restartGame: document.getElementById('restart-game'),
    fixCpu: document.getElementById('fix-cpu'),
    clearMemory: document.getElementById('clear-memory'),
    restartService: document.getElementById('restart-service'),
    fixNetwork: document.getElementById('fix-network'),
    addCpu: document.getElementById('add-cpu'),
    addMemory: document.getElementById('add-memory'),
    improveNetwork: document.getElementById('improve-network'),
    toggleAutoHeal: document.getElementById('toggle-auto-heal'),
    toggleAutoScale: document.getElementById('toggle-auto-scale'),
    pauseGame: document.getElementById('pause-game'),
    newGame: document.getElementById('new-game'),
    pauseOverlay: document.getElementById('pauseOverlay'),
    resumeGame: document.getElementById('resume-game')
};

// Canvas context
const ctx = elements.gameCanvas.getContext('2d');

// Chaos Event Definitions
const chaosEventTypes = [
    {
        name: 'CPU Spike',
        description: 'CPU usage is increasing rapidly!',
        effect: () => { gameState.metrics.cpu += 15 * gameState.difficultyMultiplier; },
        fix: 'fix-cpu',
        color: '#f38ba8',
        duration: 10000,
        severity: 'high'
    },
    {
        name: 'Memory Leak',
        description: 'Memory usage is steadily growing!',
        effect: () => { gameState.metrics.memory += 10 * gameState.difficultyMultiplier; },
        fix: 'clear-memory',
        color: '#fab387',
        duration: 15000,
        severity: 'medium'
    },
    {
        name: 'Network Latency',
        description: 'Network latency has increased dramatically!',
        effect: () => { gameState.metrics.network += 12 * gameState.difficultyMultiplier; },
        fix: 'fix-network',
        color: '#89b4fa',
        duration: 12000,
        severity: 'medium'
    },
    {
        name: 'Zombie Process',
        description: 'Zombie processes are consuming resources!',
        effect: () => { 
            gameState.metrics.cpu += 7 * gameState.difficultyMultiplier;
            gameState.metrics.memory += 5 * gameState.difficultyMultiplier;
        },
        fix: 'restart-service',
        color: '#f9e2af',
        duration: 8000,
        severity: 'medium'
    },
    {
        name: 'Error Flood',
        description: 'Error rate is spiking!',
        effect: () => { gameState.metrics.errorRate += 20 * gameState.difficultyMultiplier; },
        fix: 'restart-service',
        color: '#f38ba8',
        duration: 10000,
        severity: 'high'
    },
    {
        name: 'Database Connection Error',
        description: 'Database connections are failing!',
        effect: () => { 
            gameState.metrics.errorRate += 15 * gameState.difficultyMultiplier;
            gameState.metrics.network += 5 * gameState.difficultyMultiplier;
        },
        fix: 'restart-service',
        color: '#cba6f7',
        duration: 13000,
        severity: 'high'
    },
    {
        name: 'Cache Invalidation',
        description: 'Cache is being invalidated, increasing load!',
        effect: () => { 
            gameState.metrics.cpu += 10 * gameState.difficultyMultiplier;
            gameState.metrics.memory += 5 * gameState.difficultyMultiplier;
        },
        fix: 'fix-cpu',
        color: '#a6e3a1',
        duration: 10000,
        severity: 'low'
    },
    {
        name: 'Disk Space Full',
        description: 'Running out of disk space!',
        effect: () => { gameState.metrics.memory += 20 * gameState.difficultyMultiplier; },
        fix: 'clear-memory',
        color: '#fab387',
        duration: 10000,
        severity: 'high'
    }
];

// Initialize the game
function initGame() {
    // Reset game state
    Object.assign(gameState, {
        score: 0,
        wave: 1,
        availableResources: 10,
        isGameOver: false,
        isPaused: false,
        serverHealth: 100,
        metrics: {
            cpu: 50,
            memory: 30,
            network: 20,
            errorRate: 5
        },
        autoHealEnabled: false,
        autoScaleEnabled: false,
        currentChaosEvents: [],
        maxSimultaneousEvents: 3,
        difficultyMultiplier: 1,
        repairCosts: {
            cpu: 0,
            memory: 0,
            network: 0,
            errorRate: 0
        }
    });

    // Update UI
    updateMetricsUI();
    updateScoreUI();
    
    // Update pause button text
    elements.pauseGame.textContent = 'Pause Game';
    elements.pauseGame.classList.remove('paused');
    
    // Hide overlays
    elements.gameOver.classList.remove('show');
    elements.pauseOverlay.classList.remove('show');
    
    // Clear events log
    elements.eventsContainer.innerHTML = '';
    logEvent('Game started. Monitoring systems online.', 'info');
    
    // Reset buttons
    elements.toggleAutoHeal.textContent = 'Enable Auto-Healing';
    elements.toggleAutoHeal.classList.remove('active');
    elements.toggleAutoScale.textContent = 'Enable Auto-Scaling';
    elements.toggleAutoScale.classList.remove('active');
    
    // Start game loop
    startGameLoop();
    
    // Start wave timer
    startWaveTimer();
    
    // Draw initial server grid
    drawServerGrid();
}

// Game loop
function startGameLoop() {
    // Clear any existing intervals
    if (gameState.gameLoopInterval) {
        clearInterval(gameState.gameLoopInterval);
    }
    
    // Update game state every 100ms
    gameState.gameLoopInterval = setInterval(() => {
        if (gameState.isGameOver || gameState.isPaused) return;
        
        // Update metrics based on ongoing chaos events
        updateMetrics();
        
        // Apply auto-healing if enabled
        if (gameState.autoHealEnabled) {
            applyAutoHealing();
        }
        
        // Apply auto-scaling if enabled
        if (gameState.autoScaleEnabled) {
            applyAutoScaling();
        }
        
        // Update UI
        updateMetricsUI();
        
        // Check for server crash
        checkServerHealth();
        
        // Increase score over time
        gameState.score += 1;
        
        // Update score display every second (10 ticks)
        if (gameState.score % 10 === 0) {
            updateScoreUI();
        }
        
        // Redraw server grid
        drawServerGrid();
    }, 100);
}

// Update metrics based on current state
function updateMetrics() {
    // Natural fluctuation
    gameState.metrics.cpu += (Math.random() * 2 - 1) * gameState.difficultyMultiplier;
    gameState.metrics.memory += (Math.random() * 1.5 - 0.7) * gameState.difficultyMultiplier;
    gameState.metrics.network += (Math.random() * 1.5 - 0.8) * gameState.difficultyMultiplier;
    gameState.metrics.errorRate += (Math.random() * 1 - 0.6) * gameState.difficultyMultiplier;
    
    // Apply effects from active chaos events
    gameState.currentChaosEvents.forEach(event => {
        if (typeof event.effect === 'function') {
            event.effect();
        }
    });
    
    // Ensure metrics stay within bounds
    clampMetrics();
    
    // Calculate server health based on metrics
    calculateServerHealth();
}

// Ensure metrics stay within 0-100 range
function clampMetrics() {
    for (const metric in gameState.metrics) {
        gameState.metrics[metric] = Math.max(0, Math.min(100, gameState.metrics[metric]));
    }
}

// Calculate overall server health
function calculateServerHealth() {
    const { cpu, memory, network, errorRate } = gameState.metrics;
    
    // Higher values for these metrics mean worse server health
    // Weight them differently based on importance
    const weightedHealth = 100 - (
        (cpu * 0.3) +
        (memory * 0.25) +
        (network * 0.2) +
        (errorRate * 0.25)
    ) / 100 * 100;
    
    gameState.serverHealth = Math.max(0, Math.min(100, weightedHealth));
}

// Apply auto-healing logic
function applyAutoHealing() {
    const { cpu, memory, network, errorRate } = gameState.metrics;
    
    // Auto-healing thresholds
    if (cpu > 80) {
        gameState.metrics.cpu -= 5;
        gameState.repairCosts.cpu += 0.5;
    }
    
    if (memory > 80) {
        gameState.metrics.memory -= 5;
        gameState.repairCosts.memory += 0.5;
    }
    
    if (network > 80) {
        gameState.metrics.network -= 5;
        gameState.repairCosts.network += 0.5;
    }
    
    if (errorRate > 50) {
        gameState.metrics.errorRate -= 10;
        gameState.repairCosts.errorRate += 0.5;
    }
    
    // Periodically deduct resources based on repair costs
    if (Math.random() < 0.05) { // 5% chance per tick
        const totalCost = Object.values(gameState.repairCosts).reduce((a, b) => a + b, 0);
        if (totalCost >= 1) {
            const resourceCost = Math.floor(totalCost);
            if (gameState.availableResources >= resourceCost) {
                gameState.availableResources -= resourceCost;
                updateScoreUI();
                Object.keys(gameState.repairCosts).forEach(key => {
                    gameState.repairCosts[key] = 0;
                });
                logEvent(`Auto-healing consumed ${resourceCost} resources.`, 'warning');
            } else {
                // Not enough resources for auto-healing
                gameState.autoHealEnabled = false;
                elements.toggleAutoHeal.textContent = 'Enable Auto-Healing';
                elements.toggleAutoHeal.classList.remove('active');
                logEvent('Auto-healing disabled: Insufficient resources.', 'error');
            }
        }
    }
}

// Apply auto-scaling logic
function applyAutoScaling() {
    // Check if metrics are consistently high over multiple ticks
    if (gameState.metrics.cpu > 85 || gameState.metrics.memory > 85) {
        gameState.autoScaleCounter = (gameState.autoScaleCounter || 0) + 1;
        
        // Auto-scale after several high readings
        if (gameState.autoScaleCounter >= 10 && gameState.availableResources >= 2) {
            gameState.availableResources -= 2;
            
            // Reduce all metrics
            gameState.metrics.cpu = Math.max(gameState.metrics.cpu - 20, 0);
            gameState.metrics.memory = Math.max(gameState.metrics.memory - 20, 0);
            gameState.metrics.network = Math.max(gameState.metrics.network - 10, 0);
            
            updateScoreUI();
            logEvent('Auto-scaling triggered: Resources scaled up.', 'success');
            gameState.autoScaleCounter = 0;
        }
    } else {
        gameState.autoScaleCounter = 0;
    }
}

// Update all metrics in the UI
function updateMetricsUI() {
    const { cpu, memory, network, errorRate } = gameState.metrics;
    
    // Update progress bars
    elements.cpuBar.style.width = `${cpu}%`;
    elements.cpuValue.textContent = `${cpu.toFixed(1)}%`;
    
    elements.memoryBar.style.width = `${memory}%`;
    elements.memoryValue.textContent = `${memory.toFixed(1)}%`;
    
    elements.networkBar.style.width = `${network}%`;
    elements.networkValue.textContent = `${network.toFixed(1)}%`;
    
    elements.errorBar.style.width = `${errorRate}%`;
    elements.errorValue.textContent = `${errorRate.toFixed(1)}%`;
    
    // Change color based on severity
    elements.cpuBar.style.backgroundColor = getMetricColor(cpu);
    elements.memoryBar.style.backgroundColor = getMetricColor(memory);
    elements.networkBar.style.backgroundColor = getMetricColor(network);
    elements.errorBar.style.backgroundColor = getMetricColor(errorRate);
}

// Get color based on metric value
function getMetricColor(value) {
    if (value < 50) return '#a6e3a1'; // Green
    if (value < 75) return '#f9e2af'; // Yellow
    return '#f38ba8'; // Red
}

// Update score, wave, and resources in the UI
function updateScoreUI() {
    elements.score.textContent = gameState.score;
    elements.wave.textContent = gameState.wave;
    elements.resources.textContent = gameState.availableResources;
}

// Start wave timer
function startWaveTimer() {
    // Clear any existing wave timer
    if (gameState.waveTimer) {
        clearTimeout(gameState.waveTimer);
    }
    
    // Set wave duration based on current wave (harder waves are shorter)
    const waveDuration = Math.max(60000 - (gameState.wave * 5000), 20000);
    
    // Start chaos events for this wave
    startChaosEvents();
    
    // Log new wave
    logEvent(`Wave ${gameState.wave} started! Prepare your defenses.`, 'warning');
    
    // Set timer for next wave
    gameState.waveTimer = setTimeout(() => {
        if (gameState.isGameOver || gameState.isPaused) return;
        
        // Increase wave
        gameState.wave++;
        
        // Give player resources for surviving the wave
        const resourceReward = Math.floor(5 + (gameState.wave / 2));
        gameState.availableResources += resourceReward;
        
        // Increase difficulty
        gameState.difficultyMultiplier = 1 + (gameState.wave * 0.1);
        
        // Increase max simultaneous events
        if (gameState.wave % 3 === 0 && gameState.maxSimultaneousEvents < 8) {
            gameState.maxSimultaneousEvents++;
        }
        
        // Update UI
        updateScoreUI();
        
        // Log wave completion
        logEvent(`Wave ${gameState.wave - 1} completed! +${resourceReward} resources.`, 'success');
        
        // Start next wave
        startWaveTimer();
    }, waveDuration);
}

// Start chaos events for the current wave
function startChaosEvents() {
    // Clear any existing chaos event interval
    if (gameState.chaosEventInterval) {
        clearInterval(gameState.chaosEventInterval);
    }
    
    // Calculate event frequency based on wave (harder waves have more frequent events)
    const eventFrequency = Math.max(8000 - (gameState.wave * 500), 2000);
    
    // Start spawning chaos events
    gameState.chaosEventInterval = setInterval(() => {
        if (gameState.isGameOver || gameState.isPaused) return;
        
        // Only spawn new events if we haven't reached the maximum
        if (gameState.currentChaosEvents.length < gameState.maxSimultaneousEvents) {
            spawnChaosEvent();
        }
    }, eventFrequency);
}

// Spawn a random chaos event
function spawnChaosEvent() {
    // Select a random event type
    const eventType = chaosEventTypes[Math.floor(Math.random() * chaosEventTypes.length)];
    
    // Create the event instance
    const chaosEvent = {
        ...eventType,
        id: Date.now(),
        startTime: Date.now(),
        isActive: true,
        visualPosition: {
            x: Math.random() * (elements.gameCanvas.width - 60) + 30,
            y: Math.random() * (elements.gameCanvas.height - 60) + 30
        }
    };
    
    // Add to current events
    gameState.currentChaosEvents.push(chaosEvent);
    
    // Log the event
    logEvent(`Chaos Event: ${chaosEvent.name} - ${chaosEvent.description}`, 
             chaosEvent.severity === 'high' ? 'error' : 
             chaosEvent.severity === 'medium' ? 'warning' : 'info');
    
    // Set a timer to automatically remove the event after its duration
    setTimeout(() => {
        if (gameState.isGameOver || gameState.isPaused) return;
        
        // Find event in current events
        const eventIndex = gameState.currentChaosEvents.findIndex(e => e.id === chaosEvent.id);
        if (eventIndex !== -1) {
            // Remove the event
            gameState.currentChaosEvents.splice(eventIndex, 1);
            logEvent(`Chaos Event expired: ${chaosEvent.name}`, 'info');
        }
    }, chaosEvent.duration * (1 / gameState.difficultyMultiplier));
}

// Check if server has crashed
function checkServerHealth() {
    if (gameState.serverHealth <= 0) {
        gameOver();
    }
}

// Game over
function gameOver() {
    gameState.isGameOver = true;
    
    // Clear intervals
    clearInterval(gameState.gameLoopInterval);
    clearInterval(gameState.chaosEventInterval);
    clearTimeout(gameState.waveTimer);
    
    // Show game over screen
    elements.finalScore.textContent = gameState.score;
    elements.gameOver.classList.add('show');
    
    logEvent('CRITICAL ERROR: Server crashed!', 'error');
}

// Log an event to the events container
function logEvent(message, type = 'info') {
    const eventDiv = document.createElement('div');
    eventDiv.className = `event ${type}`;
    eventDiv.textContent = message;
    
    // Add timestamp
    const timestamp = new Date().toLocaleTimeString();
    eventDiv.textContent = `[${timestamp}] ${message}`;
    
    // Add to container
    elements.eventsContainer.prepend(eventDiv);
    
    // Limit to 20 messages
    while (elements.eventsContainer.children.length > 20) {
        elements.eventsContainer.removeChild(elements.eventsContainer.lastChild);
    }
}

// Draw server grid on canvas
function drawServerGrid() {
    const canvas = elements.gameCanvas;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid background
    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#313244';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Draw server nodes
    drawServerNodes(ctx);
    
    // Draw chaos events
    drawChaosEvents(ctx);
    
    // Draw server health indicator
    drawServerHealth(ctx);
    
    // If paused, draw paused indicator on canvas
    if (gameState.isPaused) {
        ctx.fillStyle = 'rgba(30, 30, 46, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '24px Arial';
        ctx.fillStyle = '#cba6f7';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
}

// Draw server nodes
function drawServerNodes(ctx) {
    const numServers = Math.min(5 + Math.floor(gameState.wave / 2), 15);
    
    for (let i = 0; i < numServers; i++) {
        const x = 50 + (i % 5) * 80;
        const y = 50 + Math.floor(i / 5) * 80;
        
        // Draw server
        ctx.fillStyle = getServerColor(gameState.serverHealth);
        ctx.fillRect(x - 15, y - 15, 30, 30);
        
        // Draw server border
        ctx.strokeStyle = '#cdd6f4';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 15, y - 15, 30, 30);
        
        // Draw connections between servers
        if (i > 0) {
            const prevX = 50 + ((i - 1) % 5) * 80;
            const prevY = 50 + Math.floor((i - 1) / 5) * 80;
            
            ctx.beginPath();
            ctx.strokeStyle = '#45475a';
            ctx.lineWidth = 1;
            
            // Only connect servers in the same row or column
            if (Math.floor(i / 5) === Math.floor((i - 1) / 5)) {
                // Same row
                ctx.moveTo(prevX + 15, prevY);
                ctx.lineTo(x - 15, y);
            } else if (i % 5 === 0) {
                // New row, connect to the end of the previous row
                const lastOfPrevRowX = 50 + 4 * 80;
                ctx.moveTo(lastOfPrevRowX, prevY + 15);
                ctx.lineTo(x, y - 15);
            }
            
            ctx.stroke();
        }
    }
}

// Get server color based on health
function getServerColor(health) {
    if (health > 66) return '#a6e3a1'; // Green
    if (health > 33) return '#f9e2af'; // Yellow
    return '#f38ba8'; // Red
}

// Draw active chaos events
function drawChaosEvents(ctx) {
    gameState.currentChaosEvents.forEach(event => {
        const { x, y } = event.visualPosition;
        
        // Draw event circle
        ctx.beginPath();
        ctx.fillStyle = event.color;
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw animated pulse
        const timeSinceStart = Date.now() - event.startTime;
        const pulseSize = 15 + (Math.sin(timeSinceStart / 200) * 5);
        
        ctx.beginPath();
        ctx.strokeStyle = event.color;
        ctx.lineWidth = 2;
        ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw connections to affected servers
        ctx.beginPath();
        ctx.strokeStyle = event.color;
        ctx.lineWidth = 1;
        
        // Connect to 1-3 random servers
        const numConnections = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numConnections; i++) {
            const serverX = 50 + (Math.floor(Math.random() * 5) * 80);
            const serverY = 50 + (Math.floor(Math.random() * 3) * 80);
            
            ctx.moveTo(x, y);
            ctx.lineTo(serverX, serverY);
        }
        
        ctx.stroke();
    });
}

// Draw server health indicator
function drawServerHealth(ctx) {
    const width = 120;
    const height = 20;
    const x = (canvas.width - width) / 2;
    const y = canvas.height - 30;
    
    // Background
    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(x, y, width, height);
    
    // Health bar
    ctx.fillStyle = getServerColor(gameState.serverHealth);
    ctx.fillRect(x, y, width * (gameState.serverHealth / 100), height);
    
    // Border
    ctx.strokeStyle = '#cdd6f4';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Text
    ctx.fillStyle = '#cdd6f4';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Server Health: ${gameState.serverHealth.toFixed(1)}%`, x + width / 2, y + height / 2 + 4);
}

// Toggle game pause state
function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        // Pause the game
        elements.pauseGame.textContent = 'Resume Game';
        elements.pauseGame.classList.add('paused');
        elements.pauseOverlay.classList.add('show');
        logEvent('Game paused.', 'info');
        
        // Redraw server grid with pause indicator
        drawServerGrid();
    } else {
        // Resume the game
        elements.pauseGame.textContent = 'Pause Game';
        elements.pauseGame.classList.remove('paused');
        elements.pauseOverlay.classList.remove('show');
        logEvent('Game resumed.', 'info');
        
        // Continue the game
        drawServerGrid();
    }
}

// Fix CPU spike
function fixCPU() {
    if (gameState.isGameOver || gameState.isPaused) return;
    
    // Remove CPU spike events
    const cpuEvents = gameState.currentChaosEvents.filter(event => event.name === 'CPU Spike' || event.name === 'Cache Invalidation');
    
    if (cpuEvents.length > 0) {
        // Remove the event
        const eventIndex = gameState.currentChaosEvents.indexOf(cpuEvents[0]);
        gameState.currentChaosEvents.splice(eventIndex, 1);
        
        // Reduce CPU usage
        gameState.metrics.cpu = Math.max(gameState.metrics.cpu - 25, 0);
        
        // Log
        logEvent(`Fixed issue: ${cpuEvents[0].name}`, 'success');
    } else {
        // Just reduce CPU usage a bit
        gameState.metrics.cpu = Math.max(gameState.metrics.cpu - 15, 0);
        logEvent('Optimized CPU usage.', 'info');
    }
    
    // Update UI
    updateMetricsUI();
}

// Clear memory
function clearMemory() {
    if (gameState.isGameOver || gameState.isPaused) return;
    
    // Remove memory leak events
    const memoryEvents = gameState.currentChaosEvents.filter(event => 
        event.name === 'Memory Leak' || event.name === 'Disk Space Full');
    
    if (memoryEvents.length > 0) {
        // Remove the event
        const eventIndex = gameState.currentChaosEvents.indexOf(memoryEvents[0]);
        gameState.currentChaosEvents.splice(eventIndex, 1);
        
        // Reduce memory usage
        gameState.metrics.memory = Math.max(gameState.metrics.memory - 25, 0);
        
        // Log
        logEvent(`Fixed issue: ${memoryEvents[0].name}`, 'success');
    } else {
        // Just reduce memory usage a bit
        gameState.metrics.memory = Math.max(gameState.metrics.memory - 15, 0);
        logEvent('Cleared memory caches.', 'info');
    }
    
    // Update UI
    updateMetricsUI();
}

// Restart service
function restartService() {
    if (gameState.isGameOver || gameState.isPaused) return;
    
    // Check if there are zombie process events
    const zombieEvents = gameState.currentChaosEvents.filter(event => 
        event.name === 'Zombie Process' || 
        event.name === 'Error Flood' || 
        event.name === 'Database Connection Error');
    
    if (zombieEvents.length > 0) {
        // Remove the event
        const eventIndex = gameState.currentChaosEvents.indexOf(zombieEvents[0]);
        gameState.currentChaosEvents.splice(eventIndex, 1);
        
        // Reduce relevant metrics
        gameState.metrics.errorRate = Math.max(gameState.metrics.errorRate - 30, 0);
        gameState.metrics.cpu = Math.max(gameState.metrics.cpu - 10, 0);
        
        // Log
        logEvent(`Fixed issue: ${zombieEvents[0].name}`, 'success');
    } else {
        // Just reduce error rate a bit
        gameState.metrics.errorRate = Math.max(gameState.metrics.errorRate - 15, 0);
        logEvent('Restarted service.', 'info');
    }
    
    // Update UI
    updateMetricsUI();
}

// Fix network issues
function fixNetwork() {
    if (gameState.isGameOver || gameState.isPaused) return;
    
    // Check if there are network latency events
    const networkEvents = gameState.currentChaosEvents.filter(event => event.name === 'Network Latency');
    
    if (networkEvents.length > 0) {
        // Remove the event
        const eventIndex = gameState.currentChaosEvents.indexOf(networkEvents[0]);
        gameState.currentChaosEvents.splice(eventIndex, 1);
        
        // Reduce network usage
        gameState.metrics.network = Math.max(gameState.metrics.network - 25, 0);
        
        // Log
        logEvent('Fixed issue: Network Latency', 'success');
    } else {
        // Just reduce network usage a bit
        gameState.metrics.network = Math.max(gameState.metrics.network - 15, 0);
        logEvent('Optimized network connections.', 'info');
    }
    
    // Update UI
    updateMetricsUI();
}

// Add CPU resources
function addCPU() {
    if (gameState.isGameOver || gameState.isPaused || gameState.availableResources < 1) return;
    
    // Deduct resources
    gameState.availableResources--;
    
    // Reduce CPU usage significantly
    gameState.metrics.cpu = Math.max(gameState.metrics.cpu - 30, 0);
    
    // Log
    logEvent('Added CPU resources.', 'success');
    
    // Update UI
    updateMetricsUI();
    updateScoreUI();
}

// Add memory resources
function addMemory() {
    if (gameState.isGameOver || gameState.isPaused || gameState.availableResources < 1) return;
    
    // Deduct resources
    gameState.availableResources--;
    
    // Reduce memory usage significantly
    gameState.metrics.memory = Math.max(gameState.metrics.memory - 30, 0);
    
    // Log
    logEvent('Added memory resources.', 'success');
    
    // Update UI
    updateMetricsUI();
    updateScoreUI();
}

// Improve network infrastructure
function improveNetwork() {
    if (gameState.isGameOver || gameState.isPaused || gameState.availableResources < 1) return;
    
    // Deduct resources
    gameState.availableResources--;
    
    // Reduce network usage and error rate
    gameState.metrics.network = Math.max(gameState.metrics.network - 25, 0);
    gameState.metrics.errorRate = Math.max(gameState.metrics.errorRate - 15, 0);
    
    // Log
    logEvent('Improved network infrastructure.', 'success');
    
    // Update UI
    updateMetricsUI();
    updateScoreUI();
}

// Toggle auto-healing
function toggleAutoHeal() {
    if (gameState.isGameOver || gameState.isPaused) return;
    
    gameState.autoHealEnabled = !gameState.autoHealEnabled;
    
    if (gameState.autoHealEnabled) {
        elements.toggleAutoHeal.textContent = 'Disable Auto-Healing';
        elements.toggleAutoHeal.classList.add('active');
        logEvent('Auto-healing enabled.', 'success');
    } else {
        elements.toggleAutoHeal.textContent = 'Enable Auto-Healing';
        elements.toggleAutoHeal.classList.remove('active');
        logEvent('Auto-healing disabled.', 'info');
    }
}

// Toggle auto-scaling
function toggleAutoScale() {
    if (gameState.isGameOver || gameState.isPaused) return;
    
    gameState.autoScaleEnabled = !gameState.autoScaleEnabled;
    
    if (gameState.autoScaleEnabled) {
        elements.toggleAutoScale.textContent = 'Disable Auto-Scaling';
        elements.toggleAutoScale.classList.add('active');
        logEvent('Auto-scaling enabled.', 'success');
    } else {
        elements.toggleAutoScale.textContent = 'Enable Auto-Scaling';
        elements.toggleAutoScale.classList.remove('active');
        logEvent('Auto-scaling disabled.', 'info');
    }
}

// Event listeners
function setupEventListeners() {
    // Fix buttons
    elements.fixCpu.addEventListener('click', fixCPU);
    elements.clearMemory.addEventListener('click', clearMemory);
    elements.restartService.addEventListener('click', restartService);
    elements.fixNetwork.addEventListener('click', fixNetwork);
    
    // Scale buttons
    elements.addCpu.addEventListener('click', addCPU);
    elements.addMemory.addEventListener('click', addMemory);
    elements.improveNetwork.addEventListener('click', improveNetwork);
    
    // Automation buttons
    elements.toggleAutoHeal.addEventListener('click', toggleAutoHeal);
    elements.toggleAutoScale.addEventListener('click', toggleAutoScale);
    
    // Game control buttons
    elements.pauseGame.addEventListener('click', togglePause);
    elements.newGame.addEventListener('click', initGame);
    elements.resumeGame.addEventListener('click', togglePause);
    
    // Restart game button
    elements.restartGame.addEventListener('click', initGame);
    
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
        // Pause/unpause on spacebar
        if (e.code === 'Space') {
            e.preventDefault(); // Prevent scrolling
            togglePause();
        }
        
        // New game on N key
        if (e.code === 'KeyN' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            initGame();
        }
    });
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    setupEventListeners();
    initGame();
}); 