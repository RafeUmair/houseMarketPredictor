import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { API_URL } from "../config";

//Melbourne CBD coordinates
const MELBOURNE_CENTER = [-37.8136, 144.9631];

//Suburb coordinates for Melbourne 
const SUBURB_COORDS = {
  "abbotsford": [-37.8028, 144.9994],
  "aberfeldie": [-37.7600, 144.8972],
  "airport west": [-37.7128, 144.8839],
  "albanvale": [-37.7444, 144.7689],
  "albert park": [-37.8419, 144.9567],
  "alphington": [-37.7781, 145.0306],
  "altona": [-37.8683, 144.8306],
  "altona meadows": [-37.8833, 144.7833],
  "altona north": [-37.8367, 144.8483],
  "armadale": [-37.8556, 145.0194],
  "ascot vale": [-37.7772, 144.9183],
  "ashburton": [-37.8639, 145.0806],
  "ashwood": [-37.8583, 145.0917],
  "avondale heights": [-37.7589, 144.8622],
  "balaclava": [-37.8678, 144.9933],
  "balwyn": [-37.8083, 145.0833],
  "balwyn north": [-37.7883, 145.0917],
  "bentleigh": [-37.9167, 145.0333],
  "bentleigh east": [-37.9167, 145.0500],
  "black rock": [-37.9750, 145.0250],
  "blackburn": [-37.8194, 145.1503],
  "blackburn north": [-37.8028, 145.1503],
  "blackburn south": [-37.8361, 145.1503],
  "bonbeach": [-38.0667, 145.1167],
  "box hill": [-37.8189, 145.1228],
  "box hill north": [-37.7989, 145.1228],
  "box hill south": [-37.8389, 145.1228],
  "braybrook": [-37.7886, 144.8556],
  "brighton": [-37.9056, 144.9875],
  "brighton east": [-37.9056, 145.0000],
  "broadmeadows": [-37.6814, 144.9194],
  "brunswick": [-37.7667, 144.9600],
  "brunswick east": [-37.7689, 144.9783],
  "brunswick west": [-37.7639, 144.9433],
  "bulleen": [-37.7667, 145.0833],
  "bundoora": [-37.6989, 145.0594],
  "burwood": [-37.8500, 145.1167],
  "burwood east": [-37.8500, 145.1333],
  "camberwell": [-37.8417, 145.0583],
  "campbellfield": [-37.6656, 144.9594],
  "canterbury": [-37.8222, 145.0778],
  "carlton": [-37.8000, 144.9667],
  "carlton north": [-37.7833, 144.9667],
  "carnegie": [-37.8889, 145.0556],
  "caroline springs": [-37.7333, 144.7333],
  "caulfield": [-37.8767, 145.0233],
  "caulfield east": [-37.8767, 145.0333],
  "caulfield north": [-37.8667, 145.0233],
  "caulfield south": [-37.8867, 145.0233],
  "chadstone": [-37.8833, 145.0833],
  "cheltenham": [-37.9667, 145.0500],
  "chelsea": [-38.0500, 145.1167],
  "chelsea heights": [-38.0333, 145.1333],
  "clarinda": [-37.9333, 145.1000],
  "clayton": [-37.9167, 145.1167],
  "clayton south": [-37.9333, 145.1167],
  "clifton hill": [-37.7878, 144.9969],
  "coburg": [-37.7428, 144.9639],
  "coburg north": [-37.7261, 144.9639],
  "collingwood": [-37.8028, 144.9878],
  "coolaroo": [-37.6500, 144.9333],
  "craigieburn": [-37.6000, 144.9500],
  "cremorne": [-37.8283, 144.9950],
  "dallas": [-37.6667, 144.9333],
  "dandenong": [-37.9833, 145.2167],
  "dandenong north": [-37.9667, 145.2167],
  "deer park": [-37.7667, 144.7667],
  "doncaster": [-37.7833, 145.1333],
  "doncaster east": [-37.7833, 145.1500],
  "donvale": [-37.7833, 145.1750],
  "eaglemont": [-37.7633, 145.0633],
  "east melbourne": [-37.8167, 144.9833],
  "edithvale": [-38.0333, 145.1167],
  "elsternwick": [-37.8833, 145.0000],
  "eltham": [-37.7333, 145.1500],
  "eltham north": [-37.7167, 145.1500],
  "elwood": [-37.8778, 144.9833],
  "endeavour hills": [-37.9667, 145.2500],
  "epping": [-37.6500, 145.0333],
  "essendon": [-37.7500, 144.9167],
  "essendon north": [-37.7333, 144.9167],
  "essendon west": [-37.7500, 144.9000],
  "fairfield": [-37.7789, 145.0169],
  "fawkner": [-37.7100, 144.9700],
  "fitzroy": [-37.7883, 144.9783],
  "fitzroy north": [-37.7750, 144.9783],
  "flemington": [-37.7833, 144.9333],
  "footscray": [-37.8000, 144.9000],
  "forest hill": [-37.8333, 145.1667],
  "frankston": [-38.1500, 145.1167],
  "frankston north": [-38.1333, 145.1333],
  "frankston south": [-38.1667, 145.1333],
  "gardenvale": [-37.8917, 145.0000],
  "glen huntly": [-37.8889, 145.0389],
  "glen iris": [-37.8583, 145.0583],
  "glen waverley": [-37.8833, 145.1667],
  "glenroy": [-37.7022, 144.9261],
  "hadfield": [-37.7167, 144.9500],
  "hampton": [-37.9333, 145.0000],
  "hampton east": [-37.9333, 145.0167],
  "hampton park": [-38.0333, 145.2667],
  "hawthorn": [-37.8239, 145.0358],
  "hawthorn east": [-37.8239, 145.0500],
  "heidelberg": [-37.7556, 145.0667],
  "heidelberg heights": [-37.7389, 145.0583],
  "heidelberg west": [-37.7472, 145.0417],
  "highett": [-37.9500, 145.0500],
  "hoppers crossing": [-37.8833, 144.7000],
  "hughesdale": [-37.8944, 145.0722],
  "huntingdale": [-37.9056, 145.1000],
  "ivanhoe": [-37.7667, 145.0500],
  "ivanhoe east": [-37.7667, 145.0583],
  "keilor": [-37.7167, 144.8167],
  "keilor downs": [-37.7167, 144.8000],
  "keilor east": [-37.7333, 144.8500],
  "keilor lodge": [-37.6833, 144.7833],
  "keilor park": [-37.7167, 144.8333],
  "kensington": [-37.7939, 144.9261],
  "kew": [-37.8072, 145.0356],
  "kew east": [-37.8000, 145.0500],
  "keysborough": [-37.9833, 145.1667],
  "kilsyth": [-37.8000, 145.3167],
  "kingsbury": [-37.7167, 145.0333],
  "lalor": [-37.6667, 145.0167],
  "laverton": [-37.8667, 144.7667],
  "lower plenty": [-37.7333, 145.1083],
  "maidstone": [-37.7833, 144.8833],
  "malvern": [-37.8639, 145.0306],
  "malvern east": [-37.8694, 145.0472],
  "maribyrnong": [-37.7833, 144.8833],
  "melbourne": [-37.8136, 144.9631],
  "mentone": [-37.9833, 145.0500],
  "middle park": [-37.8500, 144.9583],
  "mitcham": [-37.8167, 145.2000],
  "mont albert": [-37.8167, 145.1000],
  "mont albert north": [-37.8000, 145.1000],
  "moonee ponds": [-37.7667, 144.9167],
  "moorabbin": [-37.9333, 145.0500],
  "mordialloc": [-38.0167, 145.0833],
  "murrumbeena": [-37.8944, 145.0667],
  "newport": [-37.8417, 144.8833],
  "niddrie": [-37.7333, 144.8833],
  "noble park": [-37.9667, 145.1833],
  "noble park north": [-37.9500, 145.1833],
  "northcote": [-37.7700, 145.0000],
  "nunawading": [-37.8167, 145.1833],
  "oak park": [-37.7167, 144.9167],
  "oakleigh": [-37.9000, 145.0833],
  "oakleigh east": [-37.9000, 145.1000],
  "oakleigh south": [-37.9167, 145.0833],
  "ormond": [-37.9028, 145.0389],
  "parkdale": [-38.0000, 145.0833],
  "parkville": [-37.7833, 144.9500],
  "pascoe vale": [-37.7278, 144.9350],
  "pascoe vale south": [-37.7444, 144.9350],
  "port melbourne": [-37.8333, 144.9333],
  "prahran": [-37.8500, 144.9917],
  "preston": [-37.7333, 145.0167],
  "reservoir": [-37.7167, 145.0000],
  "richmond": [-37.8194, 144.9994],
  "ringwood": [-37.8167, 145.2333],
  "ringwood east": [-37.8167, 145.2500],
  "ringwood north": [-37.8000, 145.2333],
  "rosanna": [-37.7417, 145.0667],
  "sandringham": [-37.9500, 145.0000],
  "seaford": [-38.1000, 145.1333],
  "seddon": [-37.8083, 144.8917],
  "south kingsville": [-37.8333, 144.8667],
  "south melbourne": [-37.8333, 144.9583],
  "south morang": [-37.6500, 145.0833],
  "south yarra": [-37.8389, 144.9917],
  "spotswood": [-37.8333, 144.8833],
  "springvale": [-37.9500, 145.1500],
  "springvale south": [-37.9667, 145.1500],
  "st albans": [-37.7333, 144.8000],
  "st kilda": [-37.8667, 144.9800],
  "st kilda east": [-37.8700, 145.0000],
  "st kilda west": [-37.8583, 144.9667],
  "strathmore": [-37.7333, 144.9167],
  "strathmore heights": [-37.7250, 144.9250],
  "sunshine": [-37.7833, 144.8333],
  "sunshine north": [-37.7667, 144.8333],
  "sunshine west": [-37.7917, 144.8167],
  "surrey hills": [-37.8250, 145.0917],
  "sydenham": [-37.7000, 144.7667],
  "taylors lakes": [-37.7000, 144.8000],
  "templestowe": [-37.7583, 145.1333],
  "templestowe lower": [-37.7667, 145.1167],
  "thomastown": [-37.6833, 145.0167],
  "thornbury": [-37.7544, 145.0056],
  "toorak": [-37.8417, 145.0167],
  "truganina": [-37.8333, 144.7333],
  "tullamarine": [-37.7000, 144.8833],
  "vermont": [-37.8333, 145.2000],
  "vermont south": [-37.8500, 145.2000],
  "viewbank": [-37.7333, 145.0917],
  "wantirna south": [-37.8833, 145.2333],
  "warrandyte south": [-37.7750, 145.2417],
  "werribee": [-37.9000, 144.6667],
  "west footscray": [-37.7972, 144.8750],
  "west melbourne": [-37.8083, 144.9333],
  "westmeadows": [-37.6833, 144.8833],
  "wheelers hill": [-37.9000, 145.2000],
  "williamstown": [-37.8667, 144.8833],
  "williamstown north": [-37.8500, 144.8833],
  "windsor": [-37.8561, 144.9917],
  "wyndham vale": [-37.8833, 144.6333],
  "yarraville": [-37.8139, 144.8917],
};

//Price color scale
const getPriceColor = (price) => {
  if (!price) return "#6b7280";
  if (price < 800000) return "#22c55e";
  if (price < 1200000) return "#84cc16";
  if (price < 1600000) return "#eab308";
  if (price < 2000000) return "#f97316";
  return "#ef4444";
};

const formatPrice = (price) => {
  if (!price) return "N/A";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(price);
};

//Component to handle map view changes
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
};

export const InteractiveMap = ({ onSuburbSelect, selectedSuburb }) => {
  const [suburbStats, setSuburbStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState(MELBOURNE_CENTER);
  const [mapZoom, setMapZoom] = useState(11);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    //Fetch suburb stats from API
    fetch(`${API_URL}/all-suburb-stats`)
      .then((res) => res.json())
      .then((data) => {
        if (data.suburbs) {
          setSuburbStats(data.suburbs);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  //Update map center when selected suburb changes
  useEffect(() => {
    if (selectedSuburb) {
      const coords = SUBURB_COORDS[selectedSuburb.toLowerCase()];
      if (coords) {
        setMapCenter(coords);
        setMapZoom(14);
      }
    }
  }, [selectedSuburb]);

  const markers = useMemo(() => {
    return suburbStats
      .filter((stat) => {
        const coords = SUBURB_COORDS[stat.suburb?.toLowerCase()];
        return coords && stat.median_overall_price;
      })
      .map((stat) => {
        const coords = SUBURB_COORDS[stat.suburb.toLowerCase()];
        return {
          ...stat,
          coords,
          color: getPriceColor(stat.median_overall_price),
        };
      });
  }, [suburbStats]);

  const handleMarkerClick = (suburb) => {
    if (onSuburbSelect) {
      onSuburbSelect(suburb);
    }
    const coords = SUBURB_COORDS[suburb.toLowerCase()];
    if (coords) {
      setMapCenter(coords);
      setMapZoom(14);
    }
  };

  const handleViewDetails = (suburb) => {
    handleMarkerClick(suburb);
    setTimeout(() => {
      const statsSection = document.getElementById("stats");
      if (statsSection) {
        statsSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <>
      {/*Fullscreen overlay*/}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background">
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 z-[1000] bg-card border rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted transition flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 14 10 14 10 20"></polyline>
              <polyline points="20 10 14 10 14 4"></polyline>
              <line x1="14" y1="10" x2="21" y2="3"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
            Exit Fullscreen
          </button>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="h-full w-full"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={mapCenter} zoom={mapZoom} />
            {markers.map((marker) => (
              <CircleMarker
                key={marker.suburb}
                center={marker.coords}
                radius={10}
                fillColor={marker.color}
                color="#ffffff"
                weight={2}
                opacity={1}
                fillOpacity={0.8}
                eventHandlers={{
                  click: () => handleMarkerClick(marker.suburb),
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold text-base mb-2 capitalize">{marker.suburb}</p>
                    <p><strong>Median Price:</strong> {formatPrice(marker.median_overall_price)}</p>
                    <p><strong>Total Sales:</strong> {marker.total_sales}</p>
                    <p><strong>Distance to CBD:</strong> {marker.distance_to_cbd} km</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
          {/*Fullscreen Legend*/}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-card/90 backdrop-blur border rounded-lg px-4 py-2 flex flex-wrap justify-center gap-4">
            <span className="text-sm font-medium text-foreground">Median Price:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
              <span className="text-xs text-foreground/70">&lt; $800k</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#84cc16]"></div>
              <span className="text-xs text-foreground/70">$800k-$1.2M</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#eab308]"></div>
              <span className="text-xs text-foreground/70">$1.2M-$1.6M</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#f97316]"></div>
              <span className="text-xs text-foreground/70">$1.6M-$2M</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
              <span className="text-xs text-foreground/70">&gt; $2M</span>
            </div>
          </div>
        </div>
      )}

      <section id="map" className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <div className="max-w-6xl w-full space-y-8">
          <div className="text-center mb-8 fade-up">
            <h2 className="text-4xl md:text-5xl font-black mb-4 home-title">
              Melbourne Suburbs Map
            </h2>
            <p className="text-lg text-foreground/70">
              Explore property prices across Melbourne suburbs
            </p>
          </div>

          <div className="bg-card border rounded-xl overflow-hidden fade-up relative" style={{ animationDelay: "0.2s" }}>
            {/*Fullscreen button*/}
            <button
              onClick={toggleFullscreen}
              className="absolute top-3 right-3 z-[1000] bg-card/90 backdrop-blur border rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
              Fullscreen
            </button>
          {loading ? (
            <div className="h-[500px] flex items-center justify-center">
              <p className="text-foreground/70">Loading map...</p>
            </div>
          ) : (
            <MapContainer
              center={MELBOURNE_CENTER}
              zoom={11}
              className="h-[500px] w-full"
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController center={mapCenter} zoom={mapZoom} />

              {markers.map((marker) => (
                <CircleMarker
                  key={marker.suburb}
                  center={marker.coords}
                  radius={8}
                  fillColor={marker.color}
                  color="#ffffff"
                  weight={2}
                  opacity={1}
                  fillOpacity={0.8}
                  eventHandlers={{
                    click: () => handleMarkerClick(marker.suburb),
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold text-base mb-2 capitalize">{marker.suburb}</p>
                      <p><strong>Median Price:</strong> {formatPrice(marker.median_overall_price)}</p>
                      <p><strong>Total Sales:</strong> {marker.total_sales}</p>
                      <p><strong>Distance to CBD:</strong> {marker.distance_to_cbd} km</p>
                      <button
                        onClick={() => handleViewDetails(marker.suburb)}
                        className="mt-2 text-blue-600 hover:underline"
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center items-center gap-4 fade-up" style={{ animationDelay: "0.3s" }}>
          <span className="text-sm font-medium text-foreground">Median Price:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#22c55e]"></div>
            <span className="text-sm text-foreground/70">&lt; $800k</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#84cc16]"></div>
            <span className="text-sm text-foreground/70">$800k - $1.2M</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#eab308]"></div>
            <span className="text-sm text-foreground/70">$1.2M - $1.6M</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#f97316]"></div>
            <span className="text-sm text-foreground/70">$1.6M - $2M</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#ef4444]"></div>
            <span className="text-sm text-foreground/70">&gt; $2M</span>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};
