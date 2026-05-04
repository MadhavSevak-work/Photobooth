document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const introScreen = document.getElementById('intro-screen');
    const appContainer = document.getElementById('app-container');
    const insertCoinBtn = document.getElementById('insert-coin-btn');

    const video = document.getElementById('video');
    const filterSelect = document.getElementById('filter-select');
    const themeSelect = document.getElementById('theme-select');
    const bdayInput = document.getElementById('bday-input');
    const countdownDisplay = document.getElementById('countdown-display');
    const confettiContainer = document.getElementById('confetti-container');
    const themeEffectsLayer = document.getElementById('theme-effects-layer');
    const stripCountSelect = document.getElementById('strip-count-select');
    const countdownSelect = document.getElementById('countdown-select');
    const delaySelect = document.getElementById('delay-select');
    const captureBtn = document.getElementById('capture-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const countdownEl = document.getElementById('countdown');
    const flashEl = document.getElementById('flash');

    const reviewOverlay = document.getElementById('review-overlay');
    const reviewImg = document.getElementById('review-img');
    const retakePicBtn = document.getElementById('retake-pic-btn');
    const goAheadBtn = document.getElementById('go-ahead-btn');

    const cameraSection = document.getElementById('camera-section');
    const resultSection = document.getElementById('result-section');

    const stripContainer = document.getElementById('strip-container');
    const retakeBtn = document.getElementById('retake-btn');
    const downloadBtn = document.getElementById('download-btn');
    const printBtn = document.getElementById('print-btn');

    let stream = null;
    let capturedImages = [];
    let isCapturing = false;
    let isCancelled = false;

    // --- Sound Effects ---
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new AudioContext();
        }
    }

    function playCoinSound() {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'square';
        // Classic coin drop two-tone ping
        osc.frequency.setValueAtTime(987.77, audioCtx.currentTime); // B5
        osc.frequency.setValueAtTime(1318.51, audioCtx.currentTime + 0.1); // E6

        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    }

    function playShutterSound() {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    }

    // --- Intro Screen Logic ---
    insertCoinBtn.addEventListener('click', () => {
        initAudio();
        playCoinSound();
        introScreen.classList.add('hidden');
        setTimeout(() => {
            appContainer.classList.remove('hidden');
            startCamera();
        }, 500); // Wait for transition
    });

    // --- Theme Switcher Logic ---
    function applyThemeEffects(theme) {
        themeEffectsLayer.innerHTML = '';

        // Helper function to generate emojis at random screen edges
        function generateEmojis(emojis, className, count) {
            for (let i = 0; i < count; i++) {
                const el = document.createElement('div');
                el.className = `floating-icon ${className}`;
                el.innerText = emojis[Math.floor(Math.random() * emojis.length)];

                // Position mostly on left (10-30vw) or right (70-90vw) sides
                const isLeft = Math.random() > 0.5;
                const xPos = isLeft ? (Math.random() * 20 + 5) : (Math.random() * 20 + 70);
                el.style.left = `${xPos}vw`;
                el.style.top = `${Math.random() * 80 + 10}vh`;

                // Randomize animation timings
                el.style.animationDelay = `${Math.random() * 5}s`;
                el.style.animationDuration = `${Math.random() * 5 + 10}s`;

                themeEffectsLayer.appendChild(el);
            }
        }

        if (theme === 'theme-retro') {
            generateEmojis(['📺', '🎵', '🎞️', '🕹️'], 'retro-icon', 8);
        } else if (theme === 'theme-vintage') {
            generateEmojis(['📷', '🎞️', '🖼️', '📜'], 'vintage-icon', 6);
            // Generate dust particles
            for (let i = 0; i < 15; i++) {
                const dust = document.createElement('div');
                dust.className = 'dust-particle';
                dust.style.width = Math.random() * 4 + 2 + 'px';
                dust.style.height = dust.style.width;
                dust.style.left = Math.random() * 100 + 'vw';
                dust.style.top = Math.random() * 100 + 'vh';
                dust.style.animationDuration = Math.random() * 10 + 10 + 's'; // 10-20s
                dust.style.animationDelay = Math.random() * 5 + 's';
                themeEffectsLayer.appendChild(dust);
            }
        } else if (theme === 'theme-sketch') {
            generateEmojis(['✏️', '💖', '📷', '〰️'], 'sketch-icon', 8);
        } else if (theme === 'theme-birthday') {
            generateEmojis(['🎈', '🎂', '🎉', '🎁'], 'birthday-icon', 8);
            // Generate balloons
            const balloonColors = ['#ff69b4', '#00ffff', '#ffff00', '#dda0dd'];
            for (let i = 0; i < 5; i++) {
                const balloon = document.createElement('div');
                balloon.className = 'balloon';
                balloon.style.left = (Math.random() * 80 + 10) + 'vw';
                balloon.style.backgroundColor = balloonColors[Math.floor(Math.random() * balloonColors.length)];
                balloon.style.animationDuration = Math.random() * 10 + 15 + 's'; // 15-25s
                balloon.style.animationDelay = Math.random() * 5 + 's';
                themeEffectsLayer.appendChild(balloon);
            }
            // Generate sparkles
            for (let i = 0; i < 20; i++) {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                sparkle.style.left = Math.random() * 100 + 'vw';
                sparkle.style.top = Math.random() * 100 + 'vh';
                sparkle.style.animationDuration = Math.random() * 2 + 1 + 's';
                sparkle.style.animationDelay = Math.random() * 2 + 's';
                themeEffectsLayer.appendChild(sparkle);
            }
        }
    }

    themeSelect.addEventListener('change', (e) => {
        document.body.className = e.target.value;
        applyThemeEffects(e.target.value);
    });

    // --- Birthday Countdown & Confetti Logic ---
    let bdayInterval = null;
    let confettiInterval = null;

    function createConfetti() {
        const colors = ['#ff1493', '#00ffff', '#ffff00', '#ff69b4', '#dda0dd'];
        const el = document.createElement('div');
        el.className = 'confetti';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        el.style.animationDuration = (Math.random() * 2 + 2) + 's'; // 2s - 4s fall
        confettiContainer.appendChild(el);

        // Remove after animation completes
        setTimeout(() => {
            el.remove();
        }, 4000);
    }

    bdayInput.addEventListener('change', (e) => {
        if (bdayInterval) clearInterval(bdayInterval);
        if (confettiInterval) clearInterval(confettiInterval);
        confettiContainer.innerHTML = '';
        countdownDisplay.classList.remove('hidden');

        const inputDate = new Date(e.target.value);
        if (isNaN(inputDate)) {
            countdownDisplay.classList.add('hidden');
            return;
        }

        const bMonth = inputDate.getMonth();
        const bDate = inputDate.getDate();

        bdayInterval = setInterval(() => {
            const now = new Date();
            let nextBday = new Date(now.getFullYear(), bMonth, bDate);

            // If birthday has passed this year, next one is next year
            if (now.getTime() > nextBday.getTime() && now.getDate() !== bDate) {
                nextBday.setFullYear(now.getFullYear() + 1);
            }

            // Check if today is the birthday
            if (now.getMonth() === bMonth && now.getDate() === bDate) {
                countdownDisplay.innerHTML = "🎉 Happy Birthday! 🎉<br><span style='font-size:0.6em'>🎂 Birthday Mode Active 🎂</span>";
                if (document.body.className !== 'theme-birthday') {
                    themeSelect.value = 'theme-birthday';
                    document.body.className = 'theme-birthday';
                    applyThemeEffects('theme-birthday');
                    confettiInterval = setInterval(createConfetti, 100);
                }
                clearInterval(bdayInterval);
                return;
            }

            const diff = nextBday.getTime() - now.getTime();
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            countdownDisplay.innerHTML = `Your Birthday in:<br>${d} days, ${h} hours, ${m} minutes, ${s} seconds`;
        }, 1000);
    });

    // --- Camera Logic ---
    video.style.filter = filterSelect.value; // set initial filter

    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' },
                audio: false
            });
            video.srcObject = stream;
        } catch (err) {
            console.error("Error accessing the camera: ", err);
            alert("Could not access the camera. Please allow camera permissions.");
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }

    filterSelect.addEventListener('change', (e) => {
        const filterValue = e.target.value;
        if (filterValue === 'none') {
            video.style.filter = 'none';
        } else {
            video.style.filter = filterValue;
        }
    });

    function triggerFlash() {
        flashEl.classList.remove('active');
        void flashEl.offsetWidth;
        flashEl.classList.add('active');
    }

    function captureFrame() {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');

        // Mirror the image to match preview
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/png');
    }

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    async function runCountdown(seconds) {
        countdownEl.classList.remove('hidden');
        for (let i = seconds; i > 0; i--) {
            if (isCancelled) break;
            countdownEl.textContent = i;
            countdownEl.classList.remove('animate');
            void countdownEl.offsetWidth;
            countdownEl.classList.add('animate');
            await sleep(1000);
        }
        countdownEl.classList.add('hidden');
    }

    function waitForUserApproval() {
        return new Promise((resolve) => {
            window.currentApprovalResolve = resolve;
            const handleGoAhead = () => { cleanup(); resolve(true); };
            const handleRetake = () => { cleanup(); resolve(false); };
            const cleanup = () => {
                goAheadBtn.removeEventListener('click', handleGoAhead);
                retakePicBtn.removeEventListener('click', handleRetake);
                window.currentApprovalResolve = null;
                reviewOverlay.classList.add('hidden');
            };
            goAheadBtn.addEventListener('click', handleGoAhead);
            retakePicBtn.addEventListener('click', handleRetake);
        });
    }

    cancelBtn.addEventListener('click', () => {
        isCancelled = true;
        if (window.currentApprovalResolve) {
            window.currentApprovalResolve(false);
            window.currentApprovalResolve = null;
            reviewOverlay.classList.add('hidden');
        }
    });

    async function startCaptureSequence() {
        if (isCapturing) return;
        isCapturing = true;
        isCancelled = false;

        captureBtn.classList.add('hidden');
        cancelBtn.classList.remove('hidden');

        captureBtn.disabled = true;
        filterSelect.disabled = true;
        themeSelect.disabled = true;
        stripCountSelect.disabled = true;
        countdownSelect.disabled = true;
        delaySelect.disabled = true;
        capturedImages = [];

        const totalPhotos = parseInt(stripCountSelect.value, 10);

        let photoIndex = 0;
        while (photoIndex < totalPhotos) {
            if (isCancelled) break;
            
            cancelBtn.innerHTML = `🛑 CANCEL (${photoIndex}/${totalPhotos})`;

            const timerSeconds = parseInt(photoIndex === 0 ? countdownSelect.value : delaySelect.value, 10);
            await runCountdown(timerSeconds);
            if (isCancelled) break;
            
            playShutterSound();
            triggerFlash();

            const imgData = captureFrame();
            reviewImg.src = imgData;
            
            // Apply CSS filter to the review image for mobile reliability
            if (filterSelect.value !== 'none') {
                reviewImg.style.filter = filterSelect.value;
            } else {
                reviewImg.style.filter = 'none';
            }
            
            reviewOverlay.classList.remove('hidden');

            const approved = await waitForUserApproval();
            if (isCancelled) break;
            
            if (approved) {
                capturedImages.push(imgData);
                photoIndex++;
            }
        }

        if (!isCancelled && capturedImages.length > 0) {
            renderPhotoStrip();
            showResults();
            stopCamera();
        } else {
            // Cancelled or 0 photos captured
            capturedImages = [];
            reviewOverlay.classList.add('hidden');
        }

        isCapturing = false;
        cancelBtn.classList.add('hidden');
        captureBtn.classList.remove('hidden');
        captureBtn.innerHTML = `📸 START (${totalPhotos} PICS)`;
        
        captureBtn.disabled = false;
        filterSelect.disabled = false;
        themeSelect.disabled = false;
        stripCountSelect.disabled = false;
        countdownSelect.disabled = false;
        delaySelect.disabled = false;
    }

    captureBtn.addEventListener('click', startCaptureSequence);

    // --- DOM Photostrip Rendering ---
    function renderPhotoStrip() {
        stripContainer.innerHTML = '';

        for (let i = 0; i < capturedImages.length; i += 4) {
            const stripChunk = capturedImages.slice(i, i + 4);

            const stripDiv = document.createElement('div');
            stripDiv.className = 'photo-strip';

            const photosDiv = document.createElement('div');
            photosDiv.className = 'strip-photos';

            stripChunk.forEach(src => {
                const img = document.createElement('img');
                img.src = src;
                
                // Apply CSS filter to the result DOM images
                if (filterSelect.value !== 'none') {
                    img.style.filter = filterSelect.value;
                }
                
                photosDiv.appendChild(img);
            });

            const date = new Date();
            const dateString = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
            const isBirthdayTheme = document.body.className === 'theme-birthday';
            const topText = isBirthdayTheme ? 'Happy Birthday 🎉' : '90s BOOTH';

            const footerDiv = document.createElement('div');
            footerDiv.className = 'strip-footer-text';
            footerDiv.innerHTML = `${topText}<br><span style="font-size:0.7em">${dateString}</span>`;

            stripDiv.appendChild(photosDiv);
            stripDiv.appendChild(footerDiv);

            stripContainer.appendChild(stripDiv);
        }
    }

    function showResults() {
        cameraSection.classList.remove('active');
        resultSection.classList.add('active');
    }

    function showCamera() {
        resultSection.classList.remove('active');
        cameraSection.classList.add('active');
        startCamera();
    }

    retakeBtn.addEventListener('click', showCamera);
    printBtn.addEventListener('click', () => window.print());

    // --- Dynamic Canvas Export ---
    downloadBtn.addEventListener('click', async () => {
        const finalCanvas = document.createElement('canvas');
        const ctx = finalCanvas.getContext('2d');

        const padding = 30;
        const imgWidth = 640;
        const imgHeight = 480;

        if (capturedImages.length < 4) return;

        const numStrips = Math.ceil(capturedImages.length / 4);
        const stripWidth = imgWidth + (padding * 2);
        const footerHeight = 150;
        // Exactly 4 rows tall
        const stripHeight = padding + ((imgHeight + padding) * 4) + footerHeight;

        finalCanvas.width = stripWidth * numStrips;
        finalCanvas.height = stripHeight;

        // Strip background (white)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

        // Draw separate borders/lines between strips if more than 1
        for (let s = 1; s < numStrips; s++) {
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(s * stripWidth, 0);
            ctx.lineTo(s * stripWidth, stripHeight);
            ctx.stroke();
        }

        try {
            // Guarantee all images are loaded
            const images = await Promise.all(capturedImages.map(src => new Promise(resolve => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.src = src;
            })));

            // Draw Images
            images.forEach((img, index) => {
                const stripIndex = Math.floor(index / 4);
                const rowIndex = index % 4;

                const xPos = (stripIndex * stripWidth) + padding;
                const yPos = padding + (rowIndex * (imgHeight + padding));

                // Apply filter to the context for the final download
                if (filterSelect.value !== 'none') {
                    ctx.filter = filterSelect.value;
                } else {
                    ctx.filter = 'none';
                }

                ctx.drawImage(img, xPos, yPos, imgWidth, imgHeight);
                
                // Reset filter before drawing borders
                ctx.filter = 'none';

                // Draw thin black border around photos
                ctx.strokeStyle = '#222';
                ctx.lineWidth = 4;
                ctx.strokeRect(xPos, yPos, imgWidth, imgHeight);
            });

            // Draw Footer Text for each strip
            for (let s = 0; s < numStrips; s++) {
                const textY = finalCanvas.height - (footerHeight / 2) - 10;
                const textX = (s * stripWidth) + (stripWidth / 2);
                const isBirthdayTheme = document.body.className === 'theme-birthday';

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                ctx.fillStyle = isBirthdayTheme ? '#ff1493' : '#111';
                ctx.font = isBirthdayTheme ? 'bold 40px "Comic Neue", cursive' : 'bold 40px "Press Start 2P", cursive';
                ctx.fillText(isBirthdayTheme ? 'Happy Birthday 🎉' : '90s BOOTH', textX, textY - 20);

                const date = new Date();
                const dateString = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
                ctx.font = isBirthdayTheme ? 'bold 24px "Comic Neue", cursive' : 'bold 24px "Press Start 2P", cursive';
                ctx.fillText(dateString, textX, textY + 30);
            }

            // Trigger Download
            const link = document.createElement('a');
            link.download = `90s-booth-strip.png`;
            link.href = finalCanvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error("Error generating image", e);
            alert("Error downloading photo strip.");
        }
    });
});
