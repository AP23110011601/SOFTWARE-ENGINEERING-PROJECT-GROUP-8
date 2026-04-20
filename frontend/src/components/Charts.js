import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale);

const Charts = ({ data }) => {
  const chartData = {
    labels: ["Moisture", "Temperature", "Humidity"],
    datasets: [
      {
        label: "Sensor Values",
        data: [data.moisture, data.temperature, data.humidity],
      },
    ],
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-3">📊 Analytics</h2>
      <Bar data={chartData} />
    </div>
  );
};

export default Charts;