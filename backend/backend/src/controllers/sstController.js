const { getSST, fetchSST } = require("../../services/sstService");
const sstFn = getSST || fetchSST;

async function getMarineSST(req, res) {
  try {
    let lat = Number(req.query.lat ?? req.query.latitude);
    let lon = Number(req.query.lon ?? req.query.longitude);

    if (!Number.isFinite(lat) && Number.isFinite(Number(req.query.minLat)) && Number.isFinite(Number(req.query.maxLat))) {
      lat = (Number(req.query.minLat) + Number(req.query.maxLat)) / 2;
    }
    if (!Number.isFinite(lon) && Number.isFinite(Number(req.query.minLon)) && Number.isFinite(Number(req.query.maxLon))) {
      lon = (Number(req.query.minLon) + Number(req.query.maxLon)) / 2;
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      lat = 17.6868;
      lon = 83.2185;
    }

    let data;
    try {
      data = await sstFn(lat, lon);
    } catch (err) {
      data = {
        latitude: lat,
        longitude: lon,
        sst: null,
        source: "INCOIS ERDDAP",
        status: "UNAVAILABLE"
      };
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("SST API error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch SST data",
      details: error.message,
    });
  }
}

module.exports = {
  getMarineSST,
};
