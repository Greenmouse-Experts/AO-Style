import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

//  SalesSummaryChart
ChartJS.register(ArcElement, Tooltip, Legend);

export default function SalesSummaryChart() {
    const data = {
        labels: ['Delivered', 'Returned', 'Pending', 'Canceled'],
        datasets: [
            {
                data: [1754, 873, 1234, 270],
                backgroundColor: ['#3B82F6', '#FDBA74', '#8B5CF6', '#34D399'],
                borderWidth: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, 
            },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: (context) => `${context.label}: ${context.parsed} items`,
                },
            },
        },
    };

    return (
        <div className="bg-white p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-meduim text-gray-800">Sales Summary</h2>
                <select className="border border-gray-300 rounded-md p-2 text-sm text-gray-600">
                    <option>Sort by -</option>
                </select>
            </div>
            <div className="h-64 mb-4">
                <Pie data={data} options={options} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#3B82F6] rounded-sm"></div>
                    <span className="text-sm text-gray-800">Delivered 1,754</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#FDBA74] rounded-sm"></div>
                    <span className="text-sm text-gray-800">Returned 873</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#8B5CF6] rounded-sm"></div>
                    <span className="text-sm text-gray-800">Pending 1,234</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#34D399] rounded-sm"></div>
                    <span className="text-sm text-gray-800">Canceled 270</span>
                </div>
            </div>
        </div>
    );
}