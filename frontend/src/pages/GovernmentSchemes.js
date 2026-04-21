import React, { useEffect, useState, useMemo } from "react";
import { ExternalLink, Landmark, ShieldCheck } from "lucide-react";

const schemes = [
  {
    title: "PM-KISAN",
    category: "Central",
    description: "Income support scheme for eligible farmer families by Government of India.",
    link: "https://pmkisan.gov.in/"
  },
  {
    title: "Rythu Bharosa (Andhra Pradesh)",
    category: "Andhra Pradesh",
    description: "AP farmer support platform for scheme details and beneficiary services.",
    link: "https://ysrrythubharosa.ap.gov.in/"
  },
  {
    title: "Rythu Bandhu (Telangana)",
    category: "Telangana",
    description: "Farmer investment support scheme from Telangana government.",
    link: "https://rythubandhu.telangana.gov.in/"
  },
  {
    title: "Agristack Farmer Registry",
    category: "Central",
    description: "Farmer digital identity and agriculture service integration platform.",
    link: "https://agristack.gov.in/"
  },
  {
    title: "Soil Health Card",
    category: "Central",
    description: "Check soil test status and recommendations under central scheme.",
    link: "https://soilhealth.dac.gov.in/"
  },
  {
    title: "PMFBY Crop Insurance",
    category: "Central",
    description: "Pradhan Mantri Fasal Bima Yojana for crop insurance coverage.",
    link: "https://pmfby.gov.in/"
  },
  {
    title: "PMKSY (Per Drop More Crop)",
    category: "Central",
    description: "Micro-irrigation and efficient water management support for farmers.",
    link: "https://pmksy.gov.in/"
  },
  {
    title: "Kisan Credit Card (KCC)",
    category: "Central",
    description: "Credit support for crop production and allied agricultural activities.",
    link: "https://www.myscheme.gov.in/schemes/kcc"
  },
  {
    title: "eNAM",
    category: "Central",
    description: "National Agriculture Market portal for transparent agri trade.",
    link: "https://www.enam.gov.in/"
  },
  {
    title: "PKVY",
    category: "Central",
    description: "Paramparagat Krishi Vikas Yojana to promote organic farming clusters.",
    link: "https://pgsindia-ncof.gov.in/pkvy/index.aspx"
  },
  {
    title: "MIDH",
    category: "Central",
    description: "Mission for Integrated Development of Horticulture for high-value crops.",
    link: "https://midh.gov.in/"
  },
  {
    title: "NMSA",
    category: "Central",
    description: "National Mission for Sustainable Agriculture for climate-resilient farming.",
    link: "https://nmsa.dac.gov.in/"
  },
  {
    title: "Annadata Sukhibhava",
    category: "Andhra Pradesh",
    description: "AP farmer support initiative with input and livelihood assistance.",
    link: "https://annadathasukhibhava.ap.gov.in/"
  },
  {
    title: "AP e-Crop Booking",
    category: "Andhra Pradesh",
    description: "Digital crop booking and farmer service enrollment portal.",
    link: "https://apagrisnet.gov.in/"
  },
  {
    title: "Telangana Dharani Portal",
    category: "Telangana",
    description: "Integrated land records and agriculture-related services portal.",
    link: "https://dharani.telangana.gov.in/"
  },
  {
    title: "TS Crop Loan Waiver (Portal Info)",
    category: "Telangana",
    description: "Official updates and beneficiary information for crop loan waiver support.",
    link: "https://www.telangana.gov.in/"
  }
];

export default function GovernmentSchemes() {
  const [dbSchemes, setDbSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchemes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/schemes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.schemes?.length) {
          setDbSchemes(data.schemes);
        }
      } catch {
        setDbSchemes([]);
      } finally {
        setLoading(false);
      }
    };
    loadSchemes();
  }, []);

  const displaySchemes = useMemo(() => {
    const seen = new Set();
    const merged = [];
    for (const s of schemes) {
      const k = `${(s.title || "").trim()}|${(s.link || "").trim()}`;
      if (seen.has(k)) continue;
      seen.add(k);
      merged.push({ ...s, _source: "default" });
    }
    for (const s of dbSchemes) {
      const k = `${(s.title || "").trim()}|${(s.link || "").trim()}`;
      if (seen.has(k)) continue;
      seen.add(k);
      merged.push({ ...s, _source: "admin" });
    }
    return merged;
  }, [dbSchemes]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
        <h1 className="text-3xl font-bold text-green-900 flex items-center gap-3">
          <Landmark className="text-emerald-600" size={30} />
          Farmer Government Schemes
        </h1>
        <p className="text-green-700 mt-2">
          Useful PM and state-level schemes with direct links for quick access.
        </p>
        <p className="text-sm text-gray-500 mt-3">
          Includes Central, Andhra Pradesh, and Telangana scheme portals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading && <p className="text-sm text-gray-500">Loading latest schemes...</p>}
        {displaySchemes.map((scheme) => (
          <div key={scheme._id || scheme.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                {scheme.title}
              </h2>
              <span className="inline-flex mt-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                {scheme.category}
              </span>
              <p className="text-sm text-gray-600 mt-2">{scheme.description}</p>
            </div>
            <a
              href={scheme.link}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Open Scheme
              <ExternalLink size={16} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
