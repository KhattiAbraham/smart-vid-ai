import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const LineGraph = ({
  totalViews,
  predictedViews2Months,
  predictedViews4Months,
  predictedViews6Months,
}) => {
  // Prepare the data for the chart, including an origin point
  const data = [
    { name: "Start", value: 0 }, // Starting point at origin (0,0)
    { name: "Today's Views", value: totalViews },
    { name: "Predicted Views (2 Months)", value: predictedViews2Months },
    { name: "Predicted Views (4 Months)", value: predictedViews4Months },
    { name: "Predicted Views (6 Months)", value: predictedViews6Months },
  ];

  return (
    <div className="flex justify-center items-center mb-6 p-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-lg">
      <LineChart width={700} height={400} data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="name" stroke="#ffffff" />
        <YAxis stroke="#ffffff" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #8884d8',
          }}
          labelStyle={{ color: '#8884d8' }}
        />
        <Legend wrapperStyle={{ color: '#ffffff' }} />
        
        {/* Different colors for each line with different stroke widths */}
        <Line
          type="monotone"
          dataKey="value"
          stroke="#8884d8"
          strokeWidth={4}
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="predictedViews2Months"
          stroke="#ff7300"
          strokeWidth={4}
        />
        <Line
          type="monotone"
          dataKey="predictedViews4Months"
          stroke="#00C49F"
          strokeWidth={4}
        />
        <Line
          type="monotone"
          dataKey="predictedViews6Months"
          stroke="#FFBB28"
          strokeWidth={4}
        />
      </LineChart>
    </div>
  );
};

export default LineGraph;
