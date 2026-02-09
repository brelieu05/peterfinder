"use client";

import { insideCircle } from "geolocation-utils";

export const UCI_LOCATION = {
  latitude: 33.64607201522202,
  longitude: -117.84273146416213,
};

const CAMPUS_RADIUS_FT = 1609; // basically 1 mile

export const onCampus = (latitude: number, longitude: number) => {
  const loc = {
    latitude,
    longitude,
  };
  return insideCircle(loc, UCI_LOCATION, CAMPUS_RADIUS_FT);
};
