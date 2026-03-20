document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('fraud-form');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsCard = document.getElementById('results-card');
    const placeholder = document.getElementById('results-placeholder');
    const resultsContent = document.getElementById('results-content');
    
    const riskScoreEl = document.getElementById('risk-score');
    const progressBar = document.getElementById('progress-bar');
    const riskLevelEl = document.getElementById('risk-level');
    const riskExplanationEl = document.getElementById('risk-explanation');
    const aiInsightEl = document.getElementById('ai-insight-msg');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Disable button during "analysis"
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Analyzing...';
        lucide.createIcons();

        // Simulate short delay for "AI processing"
        setTimeout(() => {
            calculateRisk();
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i data-lucide="search"></i> Analyze Fraud Risk';
            lucide.createIcons();
        }, 800);
    });

    function calculateRisk() {
        // Inputs
        const gps = document.getElementById('gps-location').value;
        const ip = document.getElementById('ip-location').value;
        const movement = document.getElementById('movement-pattern').value;
        const device = document.getElementById('device-integrity').value;
        const network = document.getElementById('network-behavior').value;
        const activity = document.getElementById('activity-pattern').value;

        let score = 0;
        let flags = [];
        let aiInsight = "";

        // 1. GPS vs IP Mismatch
        const gpsKeywords = gps.toLowerCase().split(/[\s,°]+/);
        const ipKeywords = ip.toLowerCase().split(/[\s,]+/);
        const common = gpsKeywords.filter(k => k.length > 3 && ipKeywords.includes(k));
        
        if (common.length === 0) {
            score += 25;
            flags.push("GPS-IP mismatch: IP geolocation originates from a different region than device GPS.");
        }

        // 2. Movement Pattern
        if (movement === 'static') {
            score += 20;
            flags.push("Static location: Device reports zero movement during active delivery window.");
        } else if (movement === 'jumps') {
            score += 20;
            flags.push("Suspicious movement: Coordinate jumps exceed physical travel capabilities.");
        }

        // 3. Device Integrity
        if (device === 'mock') {
            score += 25;
            flags.push("Mock location detected: System hooks identified 'Allow Mock Locations' setting.");
        } else if (device === 'rooted') {
            score += 25;
            flags.push("Rooted device: Elevated privileges detected, increasing risk of environment manipulation.");
        }

        // 4. Network Behavior
        if (network === 'shared') {
            score += 15;
            flags.push("Coordinated network: Multiple active accounts tunneling through a single IP terminal.");
        }

        // 5. Activity Pattern
        if (activity === 'spike') {
            score += 15;
            flags.push("Anomalous activity: Spike in transaction frequency inconsistent with user history.");
        }

        // Cap score at 100
        score = Math.min(score, 100);

        // Determine Level
        let level = "LOW RISK";
        let colorClass = "risk-low";
        let bgClass = "bg-low";
        let trustColor = "#10b981";
        
        const trustScore = 100 - score;

        if (score > 70) {
            level = "HIGH RISK 🚨";
            colorClass = "risk-high";
            bgClass = "bg-high";
            trustColor = "#ef4444";
            aiInsight = "Critical behavioral anomaly: High probability of GPS spoofing or coordinated farm attack. Immediate intervention recommended.";
        } else if (score > 30) {
            level = "MEDIUM RISK";
            colorClass = "risk-medium";
            bgClass = "bg-medium";
            trustColor = "#f59e0b";
            aiInsight = "Pattern deviation: Environment attributes suggest potential manipulation. Recommend secondary verification.";
        } else {
            level = "LOW RISK";
            colorClass = "risk-low";
            bgClass = "bg-low";
            trustColor = "#10b981";
            aiInsight = "Standard integrity profile: No major spoofing indicators identified. Behavioral patterns align with legitimate use.";
        }

        // Fraud Network Alert
        const alertBanner = document.getElementById('fraud-network-alert');
        if (network === 'shared' && score > 50) {
            alertBanner.classList.remove('hidden');
        } else {
            alertBanner.classList.add('hidden');
        }

        // Behavior Profile
        const profileEl = document.getElementById('behavior-profile');
        profileEl.innerHTML = '';
        
        const profileItems = [
            { label: movement === 'natural' ? 'Steady Movement' : 'Irregular Path', positive: movement === 'natural' },
            { label: device === 'normal' ? 'Verified Hardware' : 'Modified OS', positive: device === 'normal' },
            { label: network === 'unique' ? 'Dedicated IP' : 'Shared Node', positive: network === 'unique' },
            { label: activity === 'normal' ? 'Consistent Usage' : 'Burst Activity', positive: activity === 'normal' }
        ];

        profileItems.forEach(item => {
            const chip = document.createElement('span');
            chip.className = `chip ${item.positive ? 'chip-positive' : 'chip-negative'}`;
            chip.innerText = item.label;
            profileEl.appendChild(chip);
        });

        if (flags.length === 0) {
            flags.push("No significant risk factors identified. Integrity check passed.");
        }

        // Update UI
        placeholder.classList.add('hidden');
        resultsContent.classList.remove('hidden');
        resultsContent.classList.add('fade-in');

        // Reset and trigger animations
        riskScoreEl.innerText = '0';
        progressBar.style.width = '0%';
        
        // Trust Circle
        const trustCircle = document.getElementById('trust-circle');
        const trustText = document.getElementById('trust-score-text');
        
        // Counter animation
        let currentDisplayScore = 0;
        const interval = setInterval(() => {
            if (currentDisplayScore >= score) {
                clearInterval(interval);
            } else {
                currentDisplayScore++;
                riskScoreEl.innerText = currentDisplayScore;
                
                const currentTrust = 100 - currentDisplayScore;
                trustText.innerText = currentTrust + '%';
            }
        }, 15);

        // Progress bar animation
        setTimeout(() => {
            progressBar.className = 'progress-bar ' + bgClass;
            progressBar.style.width = score + '%';
            
            // Circular chart animation
            trustCircle.style.stroke = trustColor;
            trustCircle.style.strokeDasharray = `${trustScore}, 100`;
        }, 100);

        riskLevelEl.className = 'risk-label ' + colorClass;
        riskLevelEl.innerText = level;
        
        riskExplanationEl.innerHTML = flags.join('<br><br>');
        aiInsightEl.innerText = aiInsight;
        
        // Re-run Lucide for new icons if any
        lucide.createIcons();
    }
});
