import React from "react";
import { Line } from "react-chartjs-2";

const MyChartComponent = ({ viewsData }) => {
  const chartData = {
    labels: viewsData.map(data => data.date),
    datasets: [
      {
        label: 'Views',
        data: viewsData.map(data => data.views),
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  return (
    <div className="chart-container mt-8">
      <h3 className="text-lg font-semibold mb-4">Views Over Time</h3>
      {viewsData.length > 0 ? (
        <Line data={chartData} />
      ) : (
        <p>No data available to display.</p>
      )}
    </div>
  );
};

export default MyChartComponent;
