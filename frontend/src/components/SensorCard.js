const SensorCard = ({ data }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">🌡 Sensor Data</h2>

      <p>💧 Moisture: {data.moisture}%</p>
      <p>🌡 Temperature: {data.temperature}°C</p>
      <p>💨 Humidity: {data.humidity}%</p>
    </div>
  );
};

export default SensorCard;