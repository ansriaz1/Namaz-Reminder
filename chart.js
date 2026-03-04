function generateChart(data) {
    let labels = [];
    let values = [];

    Object.keys(data).sort().forEach(date => {
        labels.push(date);
        let count = 0;
        Object.values(data[date]).forEach(v => {
            if (v) count++;
        });
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
                borderColor: 'green',
                backgroundColor: 'rgba(0,255,0,0.2)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5
                }
            }
        }
    });
}
