import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const WorldMap = ({ mapType, center = [0, 0], zoom = 2 }) => {
  const grids = [];

  // Create mesh grid: simple square grid
  const generateGrid = () => {
    const latSteps = 10; // 10 degree steps
    const lngSteps = 10;

    for (let lat = -90; lat <= 90; lat += latSteps) {
      for (let lng = -180; lng <= 180; lng += lngSteps) {
        // Draw square polygons or just lines for simplicity
        const points = [
          [lat, lng],
          [lat, lng + lngSteps],
          [lat + latSteps, lng + lngSteps],
          [lat + latSteps, lng],
          [lat, lng]
        ];
        grids.push({
          id: `mesh_${lat}_${lng}`,
          points: points,
          code: `${Math.floor((lat + 90) / latSteps)}-${Math.floor((lng + 180) / lngSteps)}`
        });
      }
    }
  };

  useEffect(() => {
    generateGrid();
  }, []);

  const getTileUrl = () => {
    if (mapType === 'satellite') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (mapType === 'terrain') {
      return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    } else if (mapType === 'watercolor') {
      return 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg';
    } else {
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url={getTileUrl()}
          attribution='&copy; OpenStreetMap contributors'
        />
        {grids.map((grid) => (
          <Polyline key={grid.id} positions={grid.points} color="blue">
            <Popup>{`Mesh Code: ${grid.code}`}</Popup>
          </Polyline>
        ))}
      </MapContainer>
    </div>
  );
};

export default WorldMap;
