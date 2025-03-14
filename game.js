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
    },
    soundEnabled: true, // Add sound state control
    currentSoundscape: null // Track current ambient soundscape
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
    resumeGame: document.getElementById('resume-game'),
    toggleSound: document.getElementById('toggle-sound')
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

// Sound System - Revolutionary "Algorithmic Sound Synthesis"
const soundSystem = {
    context: null,
    masterGain: null,
    oscillators: {},
    buffers: {},
    noiseNodes: {},
    playing: {},
    
    // Initialize the sound system
    init() {
        try {
            // Create audio context
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master gain node
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.context.destination);
            
            // Pre-create oscillators for faster response
            this.createOscillatorBank();
            
            // Generate unique synthetic sound buffers
            this.generateSoundBuffers();
            
            console.log('Sound system initialized successfully');
            return true;
        } catch (e) {
            console.error('Failed to initialize sound system:', e);
            return false;
        }
    },
    
    // Create a bank of oscillators for quick access
    createOscillatorBank() {
        const types = ['sine', 'square', 'sawtooth', 'triangle'];
        const frequencies = [220, 440, 880, 1760];
        
        types.forEach(type => {
            frequencies.forEach(freq => {
                const id = `${type}-${freq}`;
                this.oscillators[id] = {
                    type,
                    frequency: freq
                };
            });
        });
    },
    
    // Generate pre-computed sound buffers for unique sounds
    generateSoundBuffers() {
        // Generate fractalized noise patterns (unique "digital" sounds)
        this.buffers.serverHum = this.generateServerHum();
        this.buffers.cpuWhine = this.generateCPUWhine();
        this.buffers.memoryClicks = this.generateMemoryClicks();
        this.buffers.networkBuzz = this.generateNetworkBuzz();
        this.buffers.errorAlert = this.generateErrorAlert();
        this.buffers.successChime = this.generateSuccessChime();
        this.buffers.waveTransition = this.generateWaveTransition();
        this.buffers.serverCrash = this.generateServerCrash();
        this.buffers.dataProcessing = this.generateDataProcessing();
        
        // Special abstract digital soundscapes
        this.buffers.calmServer = this.generateCalmServerscape();
        this.buffers.busyServer = this.generateBusyServerscape();
        this.buffers.criticalServer = this.generateCriticalServerscape();
    },
    
    // Novel sound generation methods
    generateServerHum() {
        // A deep, evolving digital hum with harmonic complexity
        const buffer = this.context.createBuffer(2, this.context.sampleRate * 5, this.context.sampleRate);
        
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < buffer.length; i++) {
                // Complex waveform with evolving harmonics
                const t = i / buffer.sampleRate;
                const fundamental = Math.sin(2 * Math.PI * 80 * t);
                const harmonic1 = Math.sin(2 * Math.PI * 160 * t) * 0.3;
                const harmonic2 = Math.sin(2 * Math.PI * 240 * t) * 0.15;
                
                // Apply slow modulation
                const modulation = 0.1 * Math.sin(2 * Math.PI * 0.1 * t);
                
                // Digital artifacts - like data pulses
                const pulses = t % 0.5 < 0.01 ? 0.05 * Math.random() : 0;
                
                // Final waveform
                data[i] = (fundamental + harmonic1 + harmonic2) * (0.9 + modulation) + pulses;
                
                // Apply subtle amplitude envelope
                const envelope = Math.min(t / 0.5, 1) * Math.min((buffer.length - i) / (buffer.sampleRate * 0.5), 1);
                data[i] *= 0.7 * envelope;
            }
        }
        
        return buffer;
    },
    
    generateCPUWhine() {
        // High-frequency, reactive digital whine that evolves with CPU load
        const buffer = this.context.createBuffer(2, this.context.sampleRate * 3, this.context.sampleRate);
        
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < buffer.length; i++) {
                const t = i / buffer.sampleRate;
                
                // Base frequency shifts based on channel for stereo effect
                const baseFreq = 2000 + (channel * 50);
                
                // Complex frequency modulation creating digital harmonic texture
                const modFreq = baseFreq + 500 * Math.sin(2 * Math.PI * 0.2 * t);
                const mainTone = Math.sin(2 * Math.PI * modFreq * t) * 0.4;
                
                // Add digital stutters/glitches
                const stutter = Math.abs(Math.sin(2 * Math.PI * 0.8 * t)) > 0.9 ? 
                                Math.sin(2 * Math.PI * 4000 * t) * 0.2 : 0;
                                
                // Add quantization noise (simulates digital processing artifacts)
                const quantNoise = Math.round(Math.sin(2 * Math.PI * 6000 * t) * 8) / 8 * 0.1;
                
                // Combine components
                data[i] = (mainTone + stutter + quantNoise) * 
                          (0.6 + 0.4 * Math.sin(2 * Math.PI * 0.5 * t));
                          
                // Apply volume envelope
                const envelope = Math.min(t / 0.1, 1) * Math.min((buffer.length - i) / (buffer.sampleRate * 0.5), 1);
                data[i] *= envelope * 0.6;
            }
        }
        
        return buffer;
    },
    
    generateMemoryClicks() {
        // Series of digital click patterns that sound like memory operations
        const buffer = this.context.createBuffer(2, this.context.sampleRate * 2, this.context.sampleRate);
        
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const data = buffer.getChannelData(channel);
            const channelOffset = channel * 0.05; // Stereo offset
            
            // Create click patterns
            for (let i = 0; i < 40; i++) {
                // Clicks happen at pseudo-random intervals
                const clickTime = (i * 0.05 + channelOffset + Math.random() * 0.03) * buffer.sampleRate;
                const clickDuration = 0.005 * buffer.sampleRate;
                
                // Each click consists of a short burst of digital sound
                if (clickTime + clickDuration < buffer.length) {
                    for (let j = 0; j < clickDuration; j++) {
                        const idx = Math.floor(clickTime + j);
                        const t = j / buffer.sampleRate;
                        
                        // Digital click tone
                        const clickTone = Math.sin(2 * Math.PI * (800 + i * 50) * t) * 
                                         Math.exp(-j / (clickDuration * 0.3));
                                         
                        // Digital artifact
                        const artifact = Math.random() * 0.05 * Math.exp(-j / (clickDuration * 0.1));
                        
                        // Add to buffer
                        if (idx < buffer.length) {
                            data[idx] += (clickTone + artifact) * 0.6;
                        }
                    }
                }
            }
        }
        
        return buffer;
    },
    
    generateNetworkBuzz() {
        // Fluctuating network interference patterns
        const buffer = this.context.createBuffer(2, this.context.sampleRate * 3, this.context.sampleRate);
        
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < buffer.length; i++) {
                const t = i / buffer.sampleRate;
                
                // Create complex vibration patterns using multiple frequencies
                // Simulate data packets crossing the network
                const packetFreq = 4 + channel; // Different packet rates per channel
                const packetPattern = ((t * packetFreq) % 1) < 0.4 ? 1 : 0;
                
                // Create "network frequency" bands
                const band1 = Math.sin(2 * Math.PI * 800 * t) * 0.2;
                const band2 = Math.sin(2 * Math.PI * 1200 * t) * 0.15;
                const band3 = Math.sin(2 * Math.PI * 2400 * t) * 0.1;
                
                // Digital noise - quantized and limited
                const digitalNoise = Math.floor(Math.random() * 8) / 8 * 0.3;
                
                // Create fluctuating patterns to simulate network congestion
                const congestionPattern = Math.sin(2 * Math.PI * 0.2 * t) * 
                                          Math.sin(2 * Math.PI * 0.5 * t) * 0.4;
                
                // Combine all elements with envelope
                const envelope = Math.min(t / 0.2, 1) * Math.min((buffer.length - i) / (buffer.sampleRate * 0.5), 1);
                
                // Final value
                data[i] = ((band1 + band2 + band3) * packetPattern + digitalNoise * congestionPattern) * envelope * 0.7;
            }
        }
        
        return buffer;
    },
    
    generateErrorAlert() {
        // Warning alert with unique digital characteristics
        const buffer = this.context.createBuffer(2, this.context.sampleRate * 2, this.context.sampleRate);
        
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const data = buffer.getChannelData(channel);
            
            // Create 3 warning beeps with digital characteristics
            for (let beep = 0; beep < 3; beep++) {
                const beepStart = beep * 0.6 * buffer.sampleRate;
                const beepLength = 0.2 * buffer.sampleRate;
                
                for (let i = 0; i < beepLength; i++) {
                    if (beepStart + i < buffer.length) {
                        const t = i / buffer.sampleRate;
                        
                        // Base alarm tone - slightly different for each beep
                        const baseFreq = 880 + beep * 220;
                        const alarmTone = Math.sin(2 * Math.PI * baseFreq * t);
                        
                        // Add harmonics
                        const harmonic1 = Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.5;
                        const harmonic2 = Math.sin(2 * Math.PI * baseFreq * 3 * t) * 0.25;
                        
                        // Add digital distortion
                        const distortion = Math.sin(2 * Math.PI * 4000 * t) * 0.1;
                        
                        // Create envelope
                        const envelope = Math.sin(Math.PI * i / beepLength);
                        
                        // Combine components
                        data[beepStart + i] = (alarmTone + harmonic1 + harmonic2 + distortion) * envelope * 0.7;
                    }
                }
            }
        }
        
        return buffer;
    },
    
    generateSuccessChime() {
        // Positive feedback sound for successful actions
        const buffer = this.context.createBuffer(2, this.context.sampleRate * 1.5, this.context.sampleRate);
        
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const data = buffer.getChannelData(channel);
            
            // Create a pleasant ascending arpeggio
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            
            for (let i = 0; i < notes.length; i++) {
                const noteStart = i * 0.1 * buffer.sampleRate;
                const noteLength = 0.3 * buffer.sampleRate;
                
                for (let j = 0; j < noteLength; j++) {
                    if (noteStart + j < buffer.length) {
                        const t = j / buffer.sampleRate;
                        
                        // Note with slight detune for warmth
                        const detune = 1 + (channel * 0.001);
                        const noteTone = Math.sin(2 * Math.PI * notes[i] * detune * t);
                        
                        // Add shimmer with higher harmonics
                        const shimmer = Math.sin(2 * Math.PI * notes[i] * 2 * t) * 0.2 * 
                                        Math.sin(2 * Math.PI * 8 * t);
                        
                        // Envelope
                        const attack = Math.min(j / (0.05 * buffer.sampleRate), 1);
                        const release = Math.min((noteLength - j) / (0.2 * buffer.sampleRate), 1);
                        const envelope = attack * release;
                        
                        // Add to buffer
                        data[noteStart + j] += (noteTone + shimmer) * envelope * 0.25;
                    }
                }
            }
        }
        
        return buffer;
    },
    
    generateWaveTransition() {
        // Dynamic transition sound between waves
        const buffer = this.context.createBuffer(2, this.context.sampleRate * 4, this.context.sampleRate);
        
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const data = buffer.getChannelData(channel);
            
            // Whoosh effect
            for (let i = 0; i < buffer.length; i++) {
                const t = i / buffer.sampleRate;
                const phase = t / 4; // 0 to 1 over the duration
                
                // Frequency sweep from low to high
                const freqSweep = 200 + 2000 * phase;
                const whoosh = Math.sin(2 * Math.PI * freqSweep * t) * 
                               Math.exp(-Math.pow((phase - 0.5) * 4, 2));
                
                // Digital chirp 
                const chirpFreq = 500 + 3000 * Math.pow(phase, 2);
                const chirp = Math.sin(2 * Math.PI * chirpFreq * t) * 
                              Math.exp(-Math.pow((phase - 0.7) * 6, 2)) * 0.5;
                
                // Data streams
                const dataPattern = ((t * 20) % 1) < (0.1 + 0.4 * phase) ? 
                                    Math.sin(2 * Math.PI * 2000 * t) * 0.2 : 0;
                
                // Combined sound
                data[i] = (whoosh + chirp + dataPattern) * 0.7;
            }
        }
        
        return buffer;
    },
    
    generateServerCrash() {
        // Catastrophic server failure sound
        const buffer = this.context.createBuffer(2, this.context.sampleRate * 5, this.context.sampleRate);
        
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const data = buffer.getChannelData(channel);
            
            // Initial power down
            const powerDownLength = 2 * buffer.sampleRate;
            for (let i = 0; i < powerDownLength; i++) {
                const t = i / buffer.sampleRate;
                const phase = i / powerDownLength; // 0 to 1
                
                // Main tone: dropping pitch
                const dropFreq = 400 * (1 - Math.pow(phase, 2)) + 50;
                const mainTone = Math.sin(2 * Math.PI * dropFreq * t) * 
                                 (1 - phase * 0.5);
                
                // System failure stuttering
                const stutter = Math.random() > (0.9 - phase * 0.5) ? 
                                0.5 * Math.random() * Math.sin(2 * Math.PI * 300 * t) : 0;
                
                // Digital breakup
                const breakup = phase > 0.5 ? 
                                (Math.random() * 2 - 1) * phase * 0.5 : 0;
                
                // Power capacitor discharge sound
                const discharge = Math.exp(-phase * 10) * 
                                  Math.sin(2 * Math.PI * (100 + phase * 500) * t) * 0.5;
                
                // Combine
                data[i] = (mainTone + stutter + breakup + discharge) * (1 - phase * 0.5);
            }
            
            // Aftermath - digital embers
            for (let i = powerDownLength; i < buffer.length; i++) {
                const t = i / buffer.sampleRate;
                const phase = (i - powerDownLength) / (buffer.length - powerDownLength);
                
                // Small random glitches and pops
                const glitch = Math.random() > 0.99 ? 
                               Math.random() * 0.5 * Math.sin(2 * Math.PI * Math.random() * 1000 * t) : 0;
                
                // Final fade to silence
                data[i] = glitch * (1 - phase);
            }
        }
        
        return buffer;
    },
    
    generateDataProcessing() {
        // Abstract data processing sound
        const buffer = this.context.createBuffer(2, this.context.sampleRate * 2, this.context.sampleRate);
        
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const data = buffer.getChannelData(channel);
            
            // Create patterns of data processing sounds
            for (let i = 0; i < buffer.length; i++) {
                const t = i / buffer.sampleRate;
                
                // Base carrier frequency
                const carrier = Math.sin(2 * Math.PI * 800 * t) * 0.3;
                
                // Data packet patterns
                const packetRate = 30 + (channel * 5); // Different rates per channel
                const packets = Math.sin(2 * Math.PI * packetRate * t) > 0.7 ? 1 : 0;
                
                // Processing tone
                const processingTone = Math.sin(2 * Math.PI * 1200 * t) * 
                                      Math.sin(2 * Math.PI * 0.5 * t) * 0.2;
                
                // Quantization steps - simulating digital processing steps
                const quantSteps = Math.floor(t * 20) % 4;
                const quantization = Math.sin(2 * Math.PI * (500 + quantSteps * 200) * t) * 
                                    (quantSteps / 4) * 0.2;
                
                // Combine with envelope
                const envelope = Math.min(t / 0.1, 1) * Math.min((buffer.length - i) / (buffer.sampleRate * 0.5), 1);
                data[i] = (carrier * packets + processingTone + quantization) * envelope * 0.7;
            }
        }
        
        return buffer;
    },
    
    generateCalmServerscape() {
        // Peaceful ambient server room soundscape
        const buffer = this.context.createBuffer(2, this.context.sampleRate * 20, this.context.sampleRate);
        
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const data = buffer.getChannelData(channel);
            
            // Base air conditioning hum
            for (let i = 0; i < buffer.length; i++) {
                const t = i / buffer.sampleRate;
                
                // Low frequency HVAC
                const hvac = Math.sin(2 * Math.PI * 60 * t) * 0.1 + 
                             Math.sin(2 * Math.PI * (60.5 + channel * 0.2) * t) * 0.08;
                
                // Gentle server fan noise (filtered noise)
                let fanNoise = 0;
                for (let j = 1; j <= 10; j++) {
                    fanNoise += Math.sin(2 * Math.PI * (100 * j + Math.random() * 5) * t) * (0.01 / j);
                }
                
                // Occasional quiet beeps - status indicators
                const statusBeep = (t % 8 < 0.05 && t > 2) ? 
                                  Math.sin(2 * Math.PI * 2000 * t) * 0.02 * 
                                  Math.exp(-(t % 8) / 0.01) : 0;
                
                // Distant data transfer sounds
                const dataTransfer = Math.random() > 0.995 ? 
                                    Math.sin(2 * Math.PI * 1200 * t) * 0.03 * 
                                    Math.exp(-(t % 0.1) / 0.02) : 0;
                
                // Combine all elements
                data[i] = hvac + fanNoise + statusBeep + dataTransfer;
            }
        }
        
        return buffer;
    },
    
    generateBusyServerscape() {
        // Medium-load server room soundscape
        const buffer = this.context.createBuffer(2, this.context.sampleRate * 15, this.context.sampleRate);
        
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < buffer.length; i++) {
                const t = i / buffer.sampleRate;
                
                // Faster fan noise
                const fastFan = Math.sin(2 * Math.PI * 80 * t) * 0.15 + 
                               Math.sin(2 * Math.PI * (82 + channel * 0.5) * t) * 0.12;
                
                // More active server processing
                let processing = 0;
                for (let j = 1; j <= 8; j++) {
                    processing += Math.sin(2 * Math.PI * (200 * j + Math.sin(t * 0.2) * 10) * t) * (0.02 / j);
                }
                
                // Frequent status indicators and alerts
                const alerts = (Math.sin(2 * Math.PI * 0.2 * t) > 0.8) ? 
                              Math.sin(2 * Math.PI * 1500 * t) * 0.07 * 
                              Math.exp(-(t % 1) / 0.1) : 0;
                
                // Data transfer patterns
                const dataRate = 50 + Math.sin(2 * Math.PI * 0.1 * t) * 20;
                const dataTransfer = (t % (5 / dataRate) < 0.01) ? 
                                    Math.sin(2 * Math.PI * 800 * t) * 0.06 : 0;
                
                // Combine with subtle modulation
                const mod = 0.9 + Math.sin(2 * Math.PI * 0.05 * t) * 0.1;
                data[i] = (fastFan + processing + alerts + dataTransfer) * mod;
            }
        }
        
        return buffer;
    },
    
    generateCriticalServerscape() {
        // High-load, critical server status soundscape
        const buffer = this.context.createBuffer(2, this.context.sampleRate * 12, this.context.sampleRate);
        
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < buffer.length; i++) {
                const t = i / buffer.sampleRate;
                
                // Overworked cooling system
                const cooling = Math.sin(2 * Math.PI * 100 * t) * 0.2 + 
                               Math.sin(2 * Math.PI * (103 + channel * 1) * t) * 0.15;
                
                // System strain harmonics
                const strain = Math.sin(2 * Math.PI * 200 * t) * 
                              Math.sin(2 * Math.PI * 0.3 * t) * 0.15;
                
                // Warning alerts and indicators
                const warningFreq = 1.5 + Math.sin(2 * Math.PI * 0.1 * t) * 0.5;
                const warning = (t % warningFreq < 0.1) ? 
                               Math.sin(2 * Math.PI * 1800 * t) * 0.15 * 
                               Math.exp(-(t % warningFreq) / 0.05) : 0;
                
                // Irregular data processing glitches
                const glitchProb = Math.min(0.02 + Math.sin(2 * Math.PI * 0.05 * t) * 0.015, 0.03);
                const glitch = Math.random() < glitchProb ? 
                              (Math.random() * 2 - 1) * 0.2 : 0;
                
                // System error beeps
                const errorBeep = (Math.sin(2 * Math.PI * 0.15 * t) > 0.9) ? 
                                 Math.sin(2 * Math.PI * 2500 * t) * 0.2 * 
                                 Math.exp(-(t % 1) / 0.2) : 0;
                
                // Combine with pulsating modulation
                const pulseRate = 0.5 + Math.sin(2 * Math.PI * 0.2 * t) * 0.2;
                const pulseMod = 0.85 + Math.abs(Math.sin(2 * Math.PI * pulseRate * t)) * 0.15;
                
                data[i] = (cooling + strain + warning + glitch + errorBeep) * pulseMod;
            }
        }
        
        return buffer;
    },
    
    // Sound playing functions
    playSound(soundId, options = {}) {
        if (!gameState.soundEnabled || !this.context) return;
        
        const { volume = 1.0, loop = false, playbackRate = 1.0 } = options;
        
        // Stop previous instance if needed
        if (options.exclusive && this.playing[soundId]) {
            this.stopSound(soundId);
        }
        
        try {
            // Create source node
            const source = this.context.createBufferSource();
            source.buffer = this.buffers[soundId];
            source.playbackRate.value = playbackRate;
            source.loop = loop;
            
            // Create gain node for volume control
            const gainNode = this.context.createGain();
            gainNode.gain.value = volume;
            
            // Connect nodes
            source.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Start playback
            source.start(0);
            
            // Store reference
            this.playing[soundId] = {
                source,
                gainNode,
                startTime: this.context.currentTime
            };
            
            // Set auto-cleanup for non-looping sounds
            if (!loop) {
                source.onended = () => {
                    delete this.playing[soundId];
                };
            }
            
            return this.playing[soundId];
        } catch (e) {
            console.error(`Error playing sound ${soundId}:`, e);
            return null;
        }
    },
    
    stopSound(soundId) {
        if (this.playing[soundId]) {
            try {
                const { source, gainNode } = this.playing[soundId];
                
                // Fade out to avoid clicks
                gainNode.gain.setValueAtTime(gainNode.gain.value, this.context.currentTime);
                gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.05);
                
                // Stop after fade
                setTimeout(() => {
                    source.stop();
                    delete this.playing[soundId];
                }, 50);
            } catch (e) {
                console.error(`Error stopping sound ${soundId}:`, e);
            }
        }
    },
    
    // Play a synthetic tone with dynamic parameters
    playTone(options = {}) {
        if (!gameState.soundEnabled || !this.context) return;
        
        const {
            frequency = 440,
            type = 'sine',
            duration = 0.5,
            volume = 0.5,
            fadeIn = 0.05,
            fadeOut = 0.05
        } = options;
        
        try {
            // Create oscillator
            const oscillator = this.context.createOscillator();
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
            
            // Create gain node for volume control and envelope
            const gainNode = this.context.createGain();
            gainNode.gain.setValueAtTime(0, this.context.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.context.currentTime + fadeIn);
            gainNode.gain.setValueAtTime(volume, this.context.currentTime + duration - fadeOut);
            gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + duration);
            
            // Connect and play
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            oscillator.start();
            oscillator.stop(this.context.currentTime + duration);
            
            // Auto-cleanup
            setTimeout(() => {
                oscillator.disconnect();
                gainNode.disconnect();
            }, (duration + 0.1) * 1000);
            
            return oscillator;
        } catch (e) {
            console.error('Error playing tone:', e);
            return null;
        }
    },
    
    // Generate white/pink/brown noise
    playNoise(options = {}) {
        if (!gameState.soundEnabled || !this.context) return;
        
        const {
            type = 'white',
            volume = 0.2,
            duration = 1,
            fadeIn = 0.05,
            fadeOut = 0.1
        } = options;
        
        try {
            // Create noise buffer
            const bufferSize = 2 * this.context.sampleRate;
            const noiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            
            // Fill with appropriate noise type
            let lastValue = 0;
            for (let i = 0; i < bufferSize; i++) {
                let noise;
                
                if (type === 'white') {
                    // White noise - random values between -1 and 1
                    noise = Math.random() * 2 - 1;
                } else if (type === 'pink') {
                    // Approximation of pink noise - filtered white noise
                    const white = Math.random() * 2 - 1;
                    noise = (lastValue + (0.02 * white)) / 1.02;
                    lastValue = noise;
                } else if (type === 'brown') {
                    // Approximation of brown/red noise - more heavily filtered
                    const white = Math.random() * 2 - 1;
                    noise = (lastValue + (0.1 * white)) / 1.1;
                    lastValue = noise;
                }
                
                data[i] = noise;
            }
            
            // Create source and gain
            const noiseSource = this.context.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            noiseSource.loop = true;
            
            const gainNode = this.context.createGain();
            gainNode.gain.setValueAtTime(0, this.context.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.context.currentTime + fadeIn);
            
            if (duration !== Infinity) {
                gainNode.gain.setValueAtTime(volume, this.context.currentTime + duration - fadeOut);
                gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + duration);
                
                setTimeout(() => {
                    noiseSource.stop();
                }, duration * 1000);
            }
            
            // Connect and play
            noiseSource.connect(gainNode);
            gainNode.connect(this.masterGain);
            noiseSource.start();
            
            // Return control object
            const id = `noise-${Date.now()}`;
            this.noiseNodes[id] = {
                source: noiseSource,
                gain: gainNode,
                stop: () => {
                    gainNode.gain.setValueAtTime(gainNode.gain.value, this.context.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.1);
                    setTimeout(() => {
                        noiseSource.stop();
                        delete this.noiseNodes[id];
                    }, 100);
                }
            };
            
            return this.noiseNodes[id];
        } catch (e) {
            console.error('Error generating noise:', e);
            return null;
        }
    },
    
    // Play ambient server soundscape based on server health
    updateServerSoundscape() {
        if (!gameState.soundEnabled || !this.context) return;
        
        let targetSoundscape;
        
        // Select soundscape based on server health
        if (gameState.serverHealth > 75) {
            targetSoundscape = 'calmServer';
        } else if (gameState.serverHealth > 30) {
            targetSoundscape = 'busyServer';
        } else {
            targetSoundscape = 'criticalServer';
        }
        
        // Only change if needed
        if (gameState.currentSoundscape !== targetSoundscape) {
            // Fade out current soundscape
            if (gameState.currentSoundscape && this.playing[gameState.currentSoundscape]) {
                this.stopSound(gameState.currentSoundscape);
            }
            
            // Start new soundscape
            this.playSound(targetSoundscape, { 
                volume: 0.4, 
                loop: true, 
                exclusive: true 
            });
            
            gameState.currentSoundscape = targetSoundscape;
        }
    },
    
    // Play a sound when a chaos event spawns
    playChaosEventSound(eventType) {
        if (!gameState.soundEnabled || !this.context) return;
        
        switch(eventType.name) {
            case 'CPU Spike':
                this.playSound('cpuWhine', { volume: 0.6 });
                break;
            case 'Memory Leak':
                this.playSound('memoryClicks', { volume: 0.7 });
                break;
            case 'Network Latency':
                this.playSound('networkBuzz', { volume: 0.6 });
                break;
            case 'Error Cascade':
                this.playSound('errorAlert', { volume: 0.7 });
                break;
            case 'Disk Space Full':
                this.playNoise({
                    type: 'brown',
                    volume: 0.3,
                    duration: 2,
                    fadeIn: 0.1,
                    fadeOut: 0.5
                });
                
                // Add some digital fragmentation sounds
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        this.playTone({
                            frequency: 200 + (i * 300),
                            type: 'sawtooth',
                            duration: 0.1,
                            volume: 0.2
                        });
                    }, 200 * i);
                }
                break;
            case 'Zombie Process':
                // Complex layered sound for zombie processes
                this.playSound('cpuWhine', { volume: 0.3, playbackRate: 0.8 });
                
                setTimeout(() => {
                    this.playSound('memoryClicks', { volume: 0.4 });
                }, 200);
                break;
            default:
                // Generic chaos sound
                this.playTone({
                    frequency: 587.33, // D5
                    type: 'square',
                    duration: 0.3,
                    volume: 0.5
                });
                break;
        }
    },
    
    // Toggle sound on/off
    toggleSound() {
        // Toggle sound state directly
        gameState.soundEnabled = !gameState.soundEnabled;
        
        if (!gameState.soundEnabled) {
            // Stop all sounds
            Object.keys(this.playing).forEach(key => {
                this.stopSound(key);
            });
            
            Object.keys(this.noiseNodes).forEach(key => {
                this.noiseNodes[key].stop();
            });
        } else if (this.context) {
            // Resume audio context if it was suspended
            if (this.context.state === 'suspended') {
                this.context.resume();
            }
            
            // Restart ambient soundscape
            this.updateServerSoundscape();
        }
        
        return gameState.soundEnabled;
    }
};

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
        },
        soundEnabled: true,
        currentSoundscape: null
    });

    // Initialize sound system
    if (!soundSystem.context) {
        soundSystem.init();
    }

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
    
    // Start ambient server sound
    soundSystem.updateServerSoundscape();
    
    // Play game start sound
    soundSystem.playSound('dataProcessing', { volume: 0.6 });
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
        
        // Update sound environment based on server health
        soundSystem.updateServerSoundscape();
        
        // Redraw server grid with sound visualizations
        drawServerGrid();
        
        // Increment score (1 point per tick)
        gameState.score++;
        
        // Update score display every second (10 ticks)
        if (gameState.score % 10 === 0) {
            updateScoreUI();
        }
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
    
    // Calculate wave duration based on wave number
    const waveDuration = Math.max(60000 - (gameState.wave * 5000), 30000);
    
    // Log wave start
    logEvent(`Wave ${gameState.wave} started. Server systems nominal.`, 'info');
    
    // Increase difficulty slightly with each wave
    gameState.difficultyMultiplier = 1 + (gameState.wave * 0.1);
    
    // Calculate repair costs based on wave
    updateRepairCosts();
    
    // Start spawning chaos events for this wave
    startChaosEvents();
    
    // Set timer for wave end
    gameState.waveTimer = setTimeout(() => {
        if (gameState.isGameOver || gameState.isPaused) return;
        
        // Increment wave
        gameState.wave++;
        
        // Update UI
        elements.wave.textContent = gameState.wave;
        
        // Give player resources for surviving the wave
        const waveBonus = 5 + Math.floor(gameState.wave * 1.5);
        gameState.availableResources += waveBonus;
        elements.resources.textContent = gameState.availableResources;
        
        // Log wave end
        logEvent(`Wave ${gameState.wave - 1} survived! Received ${waveBonus} resources. Wave ${gameState.wave} incoming...`, 'success');
        
        // Play wave transition sound
        soundSystem.playSound('waveTransition', { volume: 0.7 });
        
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
    
    // Play chaos event sound
    soundSystem.playChaosEventSound(eventType);
    
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
    
    // Play server crash sound
    soundSystem.playSound('serverCrash', { volume: 0.8 });
    
    // Stop any ambient soundscape
    if (gameState.currentSoundscape) {
        soundSystem.stopSound(gameState.currentSoundscape);
        gameState.currentSoundscape = null;
    }
    
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

// Draw server grid
function drawServerGrid() {
    const ctx = elements.gameCanvas.getContext('2d');
    const width = elements.gameCanvas.width;
    const height = elements.gameCanvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid background
    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = '#313244';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Calculate server health
    calculateServerHealth();
    
    // Draw server nodes
    drawServerNodes(ctx);
    
    // Draw active chaos events
    drawChaosEvents(ctx);
    
    // Draw server health indicator
    drawServerHealth(ctx);
    
    // Add sound visualization if sounds are enabled
    if (gameState.soundEnabled) {
        drawSoundVisualization(ctx);
    }
    
    // If paused, draw paused indicator on canvas
    if (gameState.isPaused) {
        ctx.fillStyle = 'rgba(30, 30, 46, 0.5)';
        ctx.fillRect(0, 0, width, height);
        
        ctx.font = '24px Arial';
        ctx.fillStyle = '#cba6f7';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', width / 2, height / 2);
    }
}

// Draw sound visualization
function drawSoundVisualization(ctx) {
    const width = elements.gameCanvas.width;
    const height = elements.gameCanvas.height;
    
    // Create a sound wave visualization at the bottom
    ctx.save();
    
    // Draw based on server health (matching the soundscape)
    if (gameState.serverHealth > 75) {
        // Calm visualization - gentle sine wave
        ctx.strokeStyle = 'rgba(144, 238, 144, 0.5)'; // Light green
        drawWaveform(ctx, width, height, 1, 5, 0.5);
    } else if (gameState.serverHealth > 30) {
        // Busy visualization - more active waveform
        ctx.strokeStyle = 'rgba(255, 217, 102, 0.6)'; // Yellow
        drawWaveform(ctx, width, height, 2, 8, 0.8);
    } else {
        // Critical visualization - erratic waveform
        ctx.strokeStyle = 'rgba(255, 127, 127, 0.7)'; // Red
        drawWaveform(ctx, width, height, 3, 12, 1.2);
    }
    
    ctx.restore();
    
    // Add visualization for active chaos events
    gameState.currentChaosEvents.forEach(event => {
        const { x, y } = event.visualPosition;
        
        // Draw sound wave emanating from chaos event
        ctx.save();
        ctx.strokeStyle = event.color + '80'; // Add transparency
        ctx.lineWidth = 1;
        
        // Draw expanding circles
        const time = Date.now() - event.startTime;
        const maxRadius = 30;
        const waveCount = 3;
        
        for (let i = 0; i < waveCount; i++) {
            const offset = (i * maxRadius) / waveCount;
            const radius = (time / 500 + offset) % maxRadius;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.globalAlpha = 1 - (radius / maxRadius);
            ctx.stroke();
        }
        
        ctx.restore();
    });
}

// Helper function to draw waveforms
function drawWaveform(ctx, width, height, complexity, amplitude, speed) {
    const baseY = height - 20;
    const time = Date.now() / 1000;
    
    ctx.beginPath();
    ctx.lineWidth = 2;
    
    // Start at left edge
    ctx.moveTo(0, baseY);
    
    // Draw waveform across the bottom
    for (let x = 0; x < width; x += 2) {
        let y = baseY;
        
        // Add sine waves of different frequencies
        for (let i = 1; i <= complexity; i++) {
            y += Math.sin(time * speed * i + x / (50 / i)) * (amplitude / i);
        }
        
        ctx.lineTo(x, y);
    }
    
    ctx.stroke();
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

// Fix CPU issues
function fixCPU() {
    if (gameState.isGameOver || gameState.isPaused) return;
    
    // Check if enough resources
    if (gameState.availableResources < gameState.repairCosts.cpu) {
        logEvent('Not enough resources to fix CPU issues!', 'error');
        return;
    }
    
    // Deduct resources
    gameState.availableResources -= gameState.repairCosts.cpu;
    
    // Fix the CPU
    let cpuReduction = 30;
    
    // Apply fix
    gameState.metrics.cpu = Math.max(gameState.metrics.cpu - cpuReduction, 10);
    
    // Eliminate CPU spike events
    for (let i = gameState.currentChaosEvents.length - 1; i >= 0; i--) {
        if (gameState.currentChaosEvents[i].name === 'CPU Spike') {
            gameState.currentChaosEvents.splice(i, 1);
        }
    }
    
    // Play success sound
    soundSystem.playSound('successChime', { volume: 0.6 });
    
    // Update UI
    updateMetricsUI();
    updateScoreUI();
    
    // Log the action
    logEvent('CPU optimized. Performance improved.', 'success');
}

// Clear memory issues
function clearMemory() {
    if (gameState.isGameOver || gameState.isPaused) return;
    
    // Check if enough resources
    if (gameState.availableResources < gameState.repairCosts.memory) {
        logEvent('Not enough resources to clear memory!', 'error');
        return;
    }
    
    // Deduct resources
    gameState.availableResources -= gameState.repairCosts.memory;
    
    // Fix memory
    let memoryReduction = 30;
    
    // Apply fix
    gameState.metrics.memory = Math.max(gameState.metrics.memory - memoryReduction, 5);
    
    // Eliminate memory leak events
    for (let i = gameState.currentChaosEvents.length - 1; i >= 0; i--) {
        if (gameState.currentChaosEvents[i].name === 'Memory Leak' || 
            gameState.currentChaosEvents[i].name === 'Disk Space Full') {
            gameState.currentChaosEvents.splice(i, 1);
        }
    }
    
    // Play memory clearing sound
    soundSystem.playSound('memoryClicks', { volume: 0.7, playbackRate: 1.5 });
    setTimeout(() => {
        soundSystem.playSound('successChime', { volume: 0.5 });
    }, 500);
    
    // Update UI
    updateMetricsUI();
    updateScoreUI();
    
    // Log the action
    logEvent('Memory cleared. System running efficiently.', 'success');
}

// Restart service to fix errors
function restartService() {
    if (gameState.isGameOver || gameState.isPaused) return;
    
    // Check if enough resources
    if (gameState.availableResources < gameState.repairCosts.errorRate) {
        logEvent('Not enough resources to restart service!', 'error');
        return;
    }
    
    // Deduct resources
    gameState.availableResources -= gameState.repairCosts.errorRate;
    
    // Fix error rate
    let errorReduction = 30;
    
    // Apply fix
    gameState.metrics.errorRate = Math.max(gameState.metrics.errorRate - errorReduction, 0);
    
    // Eliminate error cascade events
    for (let i = gameState.currentChaosEvents.length - 1; i >= 0; i--) {
        if (gameState.currentChaosEvents[i].name === 'Error Cascade' || 
            gameState.currentChaosEvents[i].name === 'Zombie Process') {
            gameState.currentChaosEvents.splice(i, 1);
        }
    }
    
    // Play service restart sound sequence
    soundSystem.playSound('dataProcessing', { volume: 0.5 });
    setTimeout(() => {
        soundSystem.playSound('successChime', { volume: 0.6 });
    }, 1000);
    
    // Update UI
    updateMetricsUI();
    updateScoreUI();
    
    // Log the action
    logEvent('Service restarted. Error rate reduced significantly.', 'success');
}

// Fix network issues
function fixNetwork() {
    if (gameState.isGameOver || gameState.isPaused) return;
    
    // Check if enough resources
    if (gameState.availableResources < gameState.repairCosts.network) {
        logEvent('Not enough resources to fix network issues!', 'error');
        return;
    }
    
    // Deduct resources
    gameState.availableResources -= gameState.repairCosts.network;
    
    // Fix network
    let networkReduction = 30;
    
    // Apply fix
    gameState.metrics.network = Math.max(gameState.metrics.network - networkReduction, 5);
    
    // Eliminate network latency events
    for (let i = gameState.currentChaosEvents.length - 1; i >= 0; i--) {
        if (gameState.currentChaosEvents[i].name === 'Network Latency') {
            gameState.currentChaosEvents.splice(i, 1);
        }
    }
    
    // Play network fix sound
    soundSystem.playSound('networkBuzz', { volume: 0.4, playbackRate: 0.8 });
    setTimeout(() => {
        soundSystem.playSound('successChime', { volume: 0.6 });
    }, 300);
    
    // Update UI
    updateMetricsUI();
    updateScoreUI();
    
    // Log the action
    logEvent('Network optimized. Latency reduced.', 'success');
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
        logEvent('Auto-scaling enabled. Resources will be automatically allocated as needed.', 'info');
    } else {
        elements.toggleAutoScale.textContent = 'Enable Auto-Scaling';
        elements.toggleAutoScale.classList.remove('active');
        logEvent('Auto-scaling disabled. Manual resource management required.', 'info');
    }
}

// Toggle game sounds
function toggleSound() {
    // Call the sound system's toggle method
    const soundEnabled = soundSystem.toggleSound();
    
    // Update button text
    elements.toggleSound.textContent = soundEnabled ? 'Mute Sound' : 'Enable Sound';
    
    // Log the action
    logEvent(`Game sounds ${soundEnabled ? 'enabled' : 'disabled'}.`, 'info');
}

// Set up event listeners
function setupEventListeners() {
    elements.fixCpu.addEventListener('click', fixCPU);
    elements.clearMemory.addEventListener('click', clearMemory);
    elements.restartService.addEventListener('click', restartService);
    elements.fixNetwork.addEventListener('click', fixNetwork);
    elements.addCpu.addEventListener('click', addCPU);
    elements.addMemory.addEventListener('click', addMemory);
    elements.improveNetwork.addEventListener('click', improveNetwork);
    elements.toggleAutoHeal.addEventListener('click', toggleAutoHeal);
    elements.toggleAutoScale.addEventListener('click', toggleAutoScale);
    elements.pauseGame.addEventListener('click', togglePause);
    elements.resumeGame.addEventListener('click', togglePause);
    elements.newGame.addEventListener('click', initGame);
    elements.restartGame.addEventListener('click', initGame);
    elements.toggleSound.addEventListener('click', toggleSound);
    
    // Listen for keypress events
    document.addEventListener('keydown', (e) => {
        if (gameState.isGameOver) return;
        
        switch(e.key) {
            case 'p':
                togglePause();
                break;
            case '1':
                fixCPU();
                break;
            case '2':
                clearMemory();
                break;
            case '3':
                restartService();
                break;
            case '4':
                fixNetwork();
                break;
            case '5':
                addCPU();
                break;
            case '6':
                addMemory();
                break;
            case '7':
                improveNetwork();
                break;
            case '8':
                toggleAutoHeal();
                break;
            case '9':
                toggleAutoScale();
                break;
            case 'm':
                toggleSound();
                break;
        }
    });
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    setupEventListeners();
    initGame();
}); 