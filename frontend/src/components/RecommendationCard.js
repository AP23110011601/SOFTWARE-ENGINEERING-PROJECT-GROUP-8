const RecommendationCard = ({ recs }) => {
  return (
    <div className="bg-green-100 p-5 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-3 text-green-700">
        🌿 Recommendations
      </h2>

      {recs.map((rec, index) => (
        <div key={index} className="mb-2">
          <p className="font-medium">{rec.action}</p>
          <span className="text-sm text-gray-600">
            Priority: {rec.priority}
          </span>
        </div>
      ))}
    </div>
  );
};

export default RecommendationCard;