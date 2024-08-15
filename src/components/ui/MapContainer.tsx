"use client";

import React, { useState, useEffect } from 'react';
import Map from './Map';


const getUserLocation = (): Promise<[number, number]> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            resolve([longitude, latitude]);
          },
          (error) => {
            reject(error);
          }
        );
      }
    });
  };
  

const MapContainer: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [zoom, setZoom] = useState<number>(12); // Default zoom level

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const location = await getUserLocation();
        setUserLocation(location);
      } catch (error) {
        console.error("Error getting user location:", error);
      }
    };

    fetchLocation();
  }, []);
  return (
    <div className='w-full max-w-screen overflow-hidden border mb-10'>
      {userLocation ? (
        <Map center={userLocation} zoom={zoom} />
      ) : (
        <p>Loading map...</p>
      )}
    </div>
  );
};

export default MapContainer;
