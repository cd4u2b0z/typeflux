/* ═══════════════════════════════════════════════════════════
   TYPEFLUX — Chart System
   Beautiful visualizations for your typing data
   ═══════════════════════════════════════════════════════════ */

const ChartSystem = {
    // Draw WPM chart for test results
    drawWpmChart(canvas, wpmHistory, rawWpmHistory = null) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        
        // Set canvas size accounting for device pixel ratio
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        const width = rect.width;
        const height = rect.height;
        const padding = { top: 20, right: 20, bottom: 30, left: 50 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        
        // Get computed styles for theming
        const styles = getComputedStyle(document.documentElement);
        const textColor = styles.getPropertyValue('--text-tertiary').trim();
        const dimColor = styles.getPropertyValue('--text-dim').trim();
        const accentPrimary = styles.getPropertyValue('--accent-primary').trim();
        const accentSecondary = styles.getPropertyValue('--accent-secondary').trim();
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        if (!wpmHistory || wpmHistory.length === 0) {
            ctx.fillStyle = textColor;
            ctx.font = '14px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('No data yet', width / 2, height / 2);
            return;
        }
        
        // Calculate bounds
        const allValues = [...wpmHistory];
        if (rawWpmHistory) allValues.push(...rawWpmHistory);
        const maxWpm = Math.max(...allValues, 50);
        const minWpm = 0;
        
        // Draw grid lines
        ctx.strokeStyle = dimColor;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 4]);
        
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding.top + (chartHeight * i / gridLines);
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            
            // Y-axis labels
            const value = Math.round(maxWpm - (maxWpm * i / gridLines));
            ctx.fillStyle = textColor;
            ctx.font = '11px JetBrains Mono';
            ctx.textAlign = 'right';
            ctx.fillText(value.toString(), padding.left - 8, y + 4);
        }
        
        ctx.setLineDash([]);
        
        // Draw raw WPM line (if provided)
        if (rawWpmHistory && rawWpmHistory.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = dimColor;
            ctx.lineWidth = 1.5;
            
            rawWpmHistory.forEach((wpm, i) => {
                const x = padding.left + (chartWidth * i / (rawWpmHistory.length - 1 || 1));
                const y = padding.top + chartHeight - (chartHeight * wpm / maxWpm);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        }
        
        // Draw main WPM line
        ctx.beginPath();
        ctx.strokeStyle = accentPrimary;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const points = [];
        wpmHistory.forEach((wpm, i) => {
            const x = padding.left + (chartWidth * i / (wpmHistory.length - 1 || 1));
            const y = padding.top + chartHeight - (chartHeight * wpm / maxWpm);
            points.push({ x, y, wpm });
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw gradient fill under line
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        gradient.addColorStop(0, accentPrimary + '40');
        gradient.addColorStop(1, accentPrimary + '00');
        
        ctx.lineTo(padding.left + chartWidth, height - padding.bottom);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw points
        points.forEach((point, i) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = accentPrimary;
            ctx.fill();
            
            // Outer glow
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = accentPrimary + '30';
            ctx.fill();
        });
        
        // X-axis labels
        ctx.fillStyle = textColor;
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        
        const labelCount = Math.min(wpmHistory.length, 6);
        for (let i = 0; i < labelCount; i++) {
            const index = Math.floor(i * (wpmHistory.length - 1) / (labelCount - 1 || 1));
            const x = padding.left + (chartWidth * index / (wpmHistory.length - 1 || 1));
            ctx.fillText(`${index + 1}s`, x, height - 8);
        }
    },

    // Draw history chart for stats view
    drawHistoryChart(canvas, tests) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        const width = rect.width;
        const height = rect.height;
        const padding = { top: 20, right: 20, bottom: 40, left: 50 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        
        const styles = getComputedStyle(document.documentElement);
        const textColor = styles.getPropertyValue('--text-tertiary').trim();
        const dimColor = styles.getPropertyValue('--text-dim').trim();
        const accentPrimary = styles.getPropertyValue('--accent-primary').trim();
        const success = styles.getPropertyValue('--success').trim();
        
        ctx.clearRect(0, 0, width, height);
        
        if (!tests || tests.length === 0) {
            ctx.fillStyle = textColor;
            ctx.font = '14px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText('Complete some tests to see your progress', width / 2, height / 2);
            return;
        }
        
        // Get last 20 tests
        const recentTests = tests.slice(-20);
        const wpmValues = recentTests.map(t => t.wpm);
        const maxWpm = Math.max(...wpmValues, 50);
        
        // Draw grid
        ctx.strokeStyle = dimColor;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 4]);
        
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartHeight * i / 4);
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            
            const value = Math.round(maxWpm - (maxWpm * i / 4));
            ctx.fillStyle = textColor;
            ctx.font = '11px JetBrains Mono';
            ctx.textAlign = 'right';
            ctx.fillText(value.toString(), padding.left - 8, y + 4);
        }
        
        ctx.setLineDash([]);
        
        // Draw bars
        const barWidth = Math.max(4, (chartWidth / recentTests.length) - 4);
        const barGap = 4;
        
        recentTests.forEach((test, i) => {
            const x = padding.left + (i * (chartWidth / recentTests.length)) + barGap / 2;
            const barHeight = (test.wpm / maxWpm) * chartHeight;
            const y = padding.top + chartHeight - barHeight;
            
            // Bar gradient
            const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
            gradient.addColorStop(0, accentPrimary);
            gradient.addColorStop(1, accentPrimary + '60');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
            ctx.fill();
            
            // Highlight personal best
            if (test.wpm === Math.max(...wpmValues)) {
                ctx.strokeStyle = success;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });
        
        // X-axis label
        ctx.fillStyle = textColor;
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('recent tests →', width / 2, height - 8);
    },

    // Mini sparkline for inline display
    drawSparkline(canvas, values, color = null) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (!values || values.length < 2) return;
        
        const styles = getComputedStyle(document.documentElement);
        const lineColor = color || styles.getPropertyValue('--accent-primary').trim();
        
        const max = Math.max(...values);
        const min = Math.min(...values);
        const range = max - min || 1;
        
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        values.forEach((val, i) => {
            const x = (i / (values.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }
};

export { ChartSystem };
