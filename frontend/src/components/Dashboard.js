import { useEffect, useState } from "react";
import { getRecommendations } from "../services/api";

import SensorCard from "./SensorCard";
import RecommendationCard from "./RecommendationCard";
import AlertsPanel from "./AlertsPanel";
import Charts from "./Charts";

const Dashboard = () => {
  const [sensorData, setSensorData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await getRecommendations();

    if (res) {
      setSensorData(res.sensorData);
      setRecommendations(res.recommendations);
      setAlerts(res.alerts);
    }
  };

  if (!sensorData) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      <SensorCard data={sensorData} />
      <AlertsPanel alerts={alerts} />
      <RecommendationCard recs={recommendations} />
      <Charts data={sensorData} />

    </div>
  );
};

export default Dashboard;