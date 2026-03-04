function generateChart(data) {
    let labels = [];
    let values = [];

    Object.keys(data).sort().forEach(date => {
        labels.push(date);
        let count = 0;
        Object.values(data[date]).forEach(v => { if (v) count++; });
        values.push(count);
    });

    if (window.myChart) window.myChart.destroy();

    const ctx = document.getElementById("prayerChart").getContext("2d");
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Prayers Completed',
                data: values,
                borderColor: '#ffd700',
                backgroundColor: 'rgba(255, 215, 0, 0.2)',
                fill: true,
                tension: 0.4,   // smooth curve
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#ffd700'
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                y: { beginAtZero: true, max: 5 }
            }
        }
    });
}
