import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, Filler, CategoryScale } from 'chart.js';


ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, Filler, CategoryScale);

export default function SalesRevenueChart() {
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Sales',
                data: [10, 20, 30, 50, 80, 125.2, 100, 150, 180, 200, 220, 250],
                borderColor: '#CB3CFF',
                backgroundColor: 'rgba(139, 92, 246, 0.2)', 
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#8B5CF6',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#8B5CF6',
            },
            {
                label: 'Market',
                data: [5, 15, 25, 40, 60, 80, 90, 120, 110, 100, 130, 150],
                borderColor: '#3B82F6', 
                backgroundColor: 'rgba(59, 130, 246, 0.2)', 
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#3B82F6',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                    font: {
                        size: 12,
                    },
                },
            },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: (context) => {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        return `${label}: $${value}K`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#6B7280',
                },
            },
            y: {
                min: 0,
                max: 250,
                ticks: {
                    stepSize: 50,
                    callback: (value) => `${value}K`,
                    color: '#6B7280',
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },
        },
    };

    return (
        <div className="bg-white p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-medium text-gray-800">Sales Revenue <span className="text-green-500 text-sm">24.1%</span></h3>
                </div>
                <div>
                    <select className="border border-gray-300 rounded-md p-2 text-sm text-gray-600">
                        <option>Jan 2020 - Dec 2024</option>
                    </select>
                </div>
            </div>
            <div className="h-82">
                <Line data={data} options={options} />
            </div>
        </div>
    );
}