import React, { useState, useEffect } from "react";
import { API_URL } from "../config";

const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const formatPrice = (price) => {
  if (!price) return "N/A";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(price);
};

export const SuburbStats = ({ triggeredSuburb }) => {
  const [allSuburbs, setAllSuburbs] = useState([]);
  const [filteredSuburbs, setFilteredSuburbs] = useState([]);
  const [selectedSuburb, setSelectedSuburb] = useState("");
  const [displayedSuburb, setDisplayedSuburb] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/suburbs`)
      .then((res) => res.json())
      .then((data) => {
        setAllSuburbs(data.suburbs);
      })
      .catch(() => {
        setAllSuburbs([]);
      });
  }, []);

  useEffect(() => {
    if (triggeredSuburb) {
      setSelectedSuburb(capitalizeFirstLetter(triggeredSuburb));
      setDisplayedSuburb(capitalizeFirstLetter(triggeredSuburb));
      fetchStats(triggeredSuburb);
    }
  }, [triggeredSuburb]);

  const handleSuburbChange = (e) => {
    const value = e.target.value;
    setSelectedSuburb(value);

    const matches = allSuburbs
      .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
      .sort()
      .slice(0, 6);

    setFilteredSuburbs(value ? matches : []);
  };

  const selectSuburb = (suburb) => {
    setSelectedSuburb(capitalizeFirstLetter(suburb));
    setFilteredSuburbs([]);
  };

  const fetchStats = (suburb) => {
    setLoading(true);
    fetch(`${API_URL}/suburb-stats/${suburb}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.found) {
          setStats(data);
          setDisplayedSuburb(capitalizeFirstLetter(suburb));
        } else {
          setStats(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setStats(null);
        setLoading(false);
      });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (selectedSuburb) {
      fetchStats(selectedSuburb);
    }
  };

  return (
    <section id="stats" className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center mb-8 fade-up">
          <h2 className="text-4xl md:text-5xl font-black mb-4 home-title">
            Suburb Statistics
          </h2>
          <p className="text-lg text-foreground/70">
            Explore property market data for Melbourne suburbs
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="bg-card border rounded-xl p-6 fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="relative">
            <label className="block text-sm font-semibold mb-2 text-foreground">
              Search Suburb
            </label>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={selectedSuburb}
                  onChange={handleSuburbChange}
                  placeholder="Enter suburb name"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  autoComplete="off"
                />
                {filteredSuburbs.length > 0 && (
                  <ul className="absolute z-10 w-full bg-background border rounded-lg mt-1 max-h-40 overflow-y-auto">
                    {filteredSuburbs.map((suburb) => (
                      <li
                        key={suburb}
                        onClick={() => selectSuburb(suburb)}
                        className="px-4 py-2 cursor-pointer hover:bg-muted"
                      >
                        {capitalizeFirstLetter(suburb)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="submit"
                className="themed-button"
                disabled={loading}
              >
                {loading ? "Loading..." : "Search"}
              </button>
            </div>
          </div>
        </form>

        {stats && (
          <div className="bg-card border rounded-xl p-8 fade-up" style={{ animationDelay: "0.3s" }}>
            <h3 className="text-2xl font-bold text-center mb-6 text-foreground">
              {displayedSuburb}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary">{formatPrice(stats.median_overall_price)}</p>
                <p className="text-sm text-foreground/70">Median Price</p>
              </div>

              <div className="text-center p-4 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary">{formatPrice(stats.avg_price)}</p>
                <p className="text-sm text-foreground/70">Average Price</p>
              </div>

              <div className="text-center p-4 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.distance_to_cbd} km</p>
                <p className="text-sm text-foreground/70">Distance to CBD</p>
              </div>

              <div className="text-center p-4 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.total_sales}</p>
                <p className="text-sm text-foreground/70">Total Sales</p>
              </div>
            </div>

            <div className="mt-6 border-t pt-6">
              <h4 className="text-lg font-semibold mb-4 text-foreground">Price by Property Type</h4>
              <div className="space-y-4">
                {[
                  { label: "Houses", price: stats.median_house_price, count: stats.house_count, color: "bg-blue-500" },
                  { label: "Units", price: stats.median_unit_price, count: stats.unit_count, color: "bg-green-500" },
                  { label: "Townhouses", price: stats.median_townhouse_price, count: stats.townhouse_count, color: "bg-purple-500" },
                ].filter(item => item.price && item.count > 0).map((item) => {
                  const maxPrice = Math.max(
                    stats.median_house_price || 0,
                    stats.median_unit_price || 0,
                    stats.median_townhouse_price || 0
                  );
                  const widthPct = maxPrice > 0 ? (item.price / maxPrice) * 100 : 0;
                  return (
                    <div key={item.label} className="p-4 bg-background rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-foreground font-medium">{item.label}</span>
                        <span className="text-sm text-foreground/60">{item.count} sales</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full transition-all duration-700`}
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                        <p className="text-lg font-bold text-primary min-w-[120px] text-right">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 border-t pt-6">
              <h4 className="text-lg font-semibold mb-4 text-foreground">Property Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-lg">
                  <p className="text-xl font-bold text-primary">{stats.avg_rooms}</p>
                  <p className="text-sm text-foreground/70">Average Rooms</p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <p className="text-xl font-bold text-primary">{stats.avg_landsize ? `${stats.avg_landsize} sqm` : "N/A"}</p>
                  <p className="text-sm text-foreground/70">Avg Land Size (Houses)</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
