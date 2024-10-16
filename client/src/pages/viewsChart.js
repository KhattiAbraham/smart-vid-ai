import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';

// Register the chart elements
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const ViewsChart = () => {
    // Dummy data for views
    const normalViews = [100, 250, 450];  // Views from day 1 to day 3 (actual)
    const predictedViews = [450, 550, 700, 900];  // Predicted views from day 4 onwards

    // Merge normal and predicted views for continuous plotting
    const mergedViews = [...normalViews, ...predictedViews];

    // Days labels (combining days 1-7)
    const uploadTimes = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

    // Data for the chart
    const data = {
        labels: uploadTimes,
        datasets: [
            {
                label: 'Normal Views (Day 1-3)',
                data: [...normalViews, null, null, null],  // Only showing normal views for the first 3 days
                borderColor: 'blue',
                fill: false,
                tension: 0.1,
            },
            {
                label: 'Predicted Views (From Day 4)',
                data: [null, null, ...predictedViews],  // Starting predicted views from day 4
                borderColor: 'green',
                fill: false,
                borderDash: [5, 5],  // Dashed line to indicate prediction
                tension: 0.1,
            },
        ],
    };

    // Options for the chart
    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Video Views and Prediction Over Time',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div style={{ width: '800px', height: '600px' }}>
            <h2>Video Views and Prediction</h2>
            <Line data={data} options={options} />
        </div>
    );
};

export default ViewsChart;
