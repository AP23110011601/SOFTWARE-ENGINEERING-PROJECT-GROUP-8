const AlertsPanel = ({ alerts }) => {
  return (
    <div className="bg-red-100 p-5 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-3 text-red-600">🚨 Alerts</h2>

      {alerts.map((alert, index) => (
        <p key={index} className="text-red-700">
          {alert}
        </p>
      ))}
    </div>
  );
};

export default AlertsPanel;