import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ViewsChart = ({ viewsData }) => {
  if (!viewsData || viewsData.length === 0) {
    return <p>No view data available to display.</p>;
  }

  const chartData = {
    labels: viewsData.map(data => data.date),
    datasets: [
      {
        label: 'Views',
        data: viewsData.map(data => data.views),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Views Over Time</h3>
      <Bar data={chartData} />
    </div>
  );
};

export default ViewsChart;
