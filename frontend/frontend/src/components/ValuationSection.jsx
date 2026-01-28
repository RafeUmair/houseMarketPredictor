import React, { useEffect , useState } from "react";

const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const ValuationSection = () => {
  const [formData, setFormData] = useState({
    Rooms: "",
    Bathroom: "",
    Car: "",
    Landsize: "",
    Type_h: 0,
    Type_u: 0,
    Type_t: 0,
    Suburb: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [propertyTypeSelected, setPropertyTypeSelected] = useState(false);

  //Suburb autocomplete
  const [allSuburbs, setAllSuburbs] = useState([]);
  const [filteredSuburbs, setFilteredSuburbs] = useState([]);
  const [suburbSupported, setSuburbSupported] = useState(true);

  const [isLandsizeVisible, setIsLandsizeVisible] = useState(false);
  const [modelStats, setModelStats] = useState(null);

  const getDefaultLandsize = (type, rooms) => {
    if (type === 'u') {
      if (rooms == 1) return 75;
      if (rooms == 2) return 100;
      return 150;
    } else if (type === 't') {
      if (rooms == 1) return 100;
      if (rooms == 2) return 150;
      return 200;
    }
    return '';
  };

  useEffect(() => {
    fetch("http://localhost:8000/suburbs")
      .then((res) => res.json())
      .then((data) => {
        setAllSuburbs(data.suburbs);
      })
      .catch(() => {
        setAllSuburbs([]);
      });

    fetch("http://localhost:8000/model-stats")
      .then((res) => res.json())
      .then((data) => {
        setModelStats(data);
      })
      .catch(() => {
        setModelStats(null);
      });
    }, []);


  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (name === "propertyType") {
      setFormData((prev) => ({
        ...prev,
        Type_h: 0,
        Type_u: 0,
        Type_t: 0,
        [value === "h" ? "Type_h" : value === "u" ? "Type_u" : "Type_t"]: 1,
      }));
      setPropertyTypeSelected(true);
      setIsLandsizeVisible(value === 'h');
      if (value !== 'h' && formData.Rooms) {
        const defaultLandsize = getDefaultLandsize(value, Number(formData.Rooms));
        setFormData((prev) => ({ ...prev, Landsize: defaultLandsize }));
      }
    } else if (name === "Suburb") {
      const capitalizedValue = capitalizeFirstLetter(value);
      setFormData((prev) => ({ ...prev, Suburb: capitalizedValue }));

      const matches = allSuburbs
        .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
        .sort()
        .slice(0, 6);

      setFilteredSuburbs(value ? matches : []);
      setSuburbSupported(value === '' || matches.length > 0);
    } else {
      const newValue =
        type === "number" ? (value === "" ? "" : parseFloat(value) || 0) : value;
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
      if (name === "Rooms" && (formData.Type_u === 1 || formData.Type_t === 1)) {
        const type = formData.Type_u === 1 ? 'u' : 't';
        const defaultLandsize = getDefaultLandsize(type, Number(newValue));
        setFormData((prev) => ({ ...prev, Landsize: defaultLandsize }));
      }
    }
  };

  const selectSuburb = (suburb) => {
    const capitalizedSuburb = capitalizeFirstLetter(suburb);
    setFormData((prev) => ({ ...prev, Suburb: capitalizedSuburb }));
    setFilteredSuburbs([]);
    setSuburbSupported(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    //Validate required fields
    const requiredFields = ["Rooms", "Bathroom", "Car", "Suburb"];
    if (isLandsizeVisible) requiredFields.push("Landsize");
    const emptyFields = requiredFields.filter(
      (field) => formData[field] === "" || formData[field] === null
    );

    if (emptyFields.length > 0) {
      setError(
        `Please fill in all required fields: ${emptyFields.join(", ")}`
      );
      setLoading(false);
      return;
    }

    if (formData.Suburb && !suburbSupported) {
      setError("Suburb not supported");
      setLoading(false);
      return;
    }

    if (!propertyTypeSelected) {
      setError("Please select a property type");
      setLoading(false);
      return;
    }

    // Prepare data for API
    const type = formData.Type_h === 1 ? 'h' : formData.Type_u === 1 ? 'u' : 't';
    const landsize = isLandsizeVisible ? Number(formData.Landsize) : getDefaultLandsize(type, Number(formData.Rooms));
    const numericData = {
      Rooms: Number(formData.Rooms),
      Bathroom: Number(formData.Bathroom),
      Car: Number(formData.Car),
      Landsize: landsize,
      Type_h: formData.Type_h,
      Type_u: formData.Type_u,
      Type_t: formData.Type_t,
      Suburb: formData.Suburb,
    };

    try {
      const response = await fetch("http://localhost:8000/predictPrice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(numericData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to get prediction: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      setError(
        "Failed to get prediction. Make sure the API server is running and all fields are filled correctly."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const isPropertyTypeSelected =
    formData.Type_h === 1 ||
    formData.Type_u === 1 ||
    formData.Type_t === 1;

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center mb-8 fade-up">
          <h2 className="text-4xl md:text-5xl font-black mb-4 home-title">
            Get Your Property Valuation
          </h2>
          <p className="text-lg text-foreground/70">
            Enter your property details to get an instant price estimate
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-card border rounded-xl p-6 md:p-8 fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                Number of Rooms *
              </label>
              <input
                type="number"
                name="Rooms"
                value={formData.Rooms}
                onChange={handleChange}
                min="1"
                max="10"
                placeholder="Enter number of rooms"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                Number of Bathrooms *
              </label>
              <input
                type="number"
                name="Bathroom"
                value={formData.Bathroom}
                onChange={handleChange}
                min="1"
                max="10"
                placeholder="Enter number of bathrooms"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                Car Spaces *
              </label>
              <input
                type="number"
                name="Car"
                value={formData.Car}
                onChange={handleChange}
                min="0"
                max="10"
                placeholder="Enter number of car spaces"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {isLandsizeVisible && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Land Size (sqm) *
                </label>
                <input
                  type="number"
                  name="Landsize"
                  value={formData.Landsize}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  placeholder="Enter land size"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            )}

            <div className="md:col-span-2 relative">
              <label className="block text-sm font-semibold mb-2 text-foreground">
                Suburb *
              </label>
              <input
                type="text"
                name="Suburb"
                value={formData.Suburb}
                onChange={handleChange}
                placeholder="Enter suburb"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                autoComplete="off"
                required
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
              {formData.Suburb && !suburbSupported && (
                <p className="text-sm text-red-500 mt-1">
                  Suburb not supported
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-foreground">
                Property Type *
              </label>
              <div className="grid grid-cols-3 gap-4">
                {["h", "u", "t"].map((type) => (
                  <label
                    key={type}
                    className={`flex items-center space-x-2 p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData[`Type_${type}`] === 1
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="propertyType"
                      value={type}
                      checked={formData[`Type_${type}`] === 1}
                      onChange={handleChange}
                      className="text-primary"
                    />
                    <span className="text-foreground">
                      {type === "h"
                        ? "House"
                        : type === "u"
                        ? "Unit"
                        : "Townhouse"}
                    </span>
                  </label>
                ))}
              </div>
              {!isPropertyTypeSelected && (
                <p className="mt-2 text-sm text-amber-500">
                  Please select a property type
                </p>
              )}
            </div>
          </div>

          <div className="text-sm text-foreground/60">
            <p>* Required fields</p>
          </div>

          <button
            type="submit"
            className="themed-button w-full fade-up disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Calculating..." : "Get Valuation"}
          </button>
        </form>

        {prediction && (
          <div className="bg-card border rounded-xl p-8 text-center fade-up">
            <h3 className="text-2xl font-semibold mb-4 text-foreground">
              Estimated Property Value
            </h3>
            <p className="text-5xl font-black text-primary mb-2">
              {formatPrice(prediction.predicted_price)}
            </p>
            <p className="text-sm text-foreground/60 mb-4">
              Range: {formatPrice(prediction.price_low)} - {formatPrice(prediction.price_high)}
            </p>
            <div className="flex justify-center gap-6 mt-4 mb-2">
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">{prediction.confidence_pct}%</p>
                <p className="text-xs text-foreground/60">Confidence</p>
              </div>
            </div>
            <p className="text-sm text-foreground/70">
              Based on {modelStats ? modelStats.training_samples.toLocaleString() : ''} Melbourne properties
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        )}
      </div>
    </section>
  );
};
