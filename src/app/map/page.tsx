"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import RouteMap from "@/components/RouteMap";
import { RouteWithStops } from "../types";

export default function MapPage() {
  const router = useRouter();
  const [routeData, setRouteData] = useState<RouteWithStops | null>(null);

  useEffect(() => {
    // Get route data from sessionStorage
    const storedData = sessionStorage.getItem("routeData");
    if (storedData) {
      setRouteData(JSON.parse(storedData));
    } else {
      // If no data, redirect back to home
      router.push("/");
    }
  }, [router]);

  if (!routeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#4169E1] text-white py-4 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/eld-logs")}
                className="flex items-center text-white hover:text-gray-200 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Logs
              </button>
              <h1 className="text-2xl md:text-3xl font-bold">
                ELD Trip Planner - Route Map
              </h1>
            </div>
            <button
              onClick={() => router.push("/eld-logs")}
              className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Logs
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Route Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-1">Total Distance</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(routeData.totalDistance)} miles
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-1">Total Stops</p>
                <p className="text-2xl font-bold text-green-600">
                  {routeData.stops.length}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-1">Total Days</p>
                <p className="text-2xl font-bold text-purple-600">
                  {routeData.eldLogs.length}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Stop Legend
            </h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#33cc33] mr-2"></div>
                <span className="text-sm text-gray-700">Start</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#3366ff] mr-2"></div>
                <span className="text-sm text-gray-700">Pickup</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#ff3300] mr-2"></div>
                <span className="text-sm text-gray-700">Dropoff</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#ffcc00] mr-2"></div>
                <span className="text-sm text-gray-700">Rest</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#9933ff] mr-2"></div>
                <span className="text-sm text-gray-700">Fuel</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#000000] mr-2"></div>
                <span className="text-sm text-gray-700">Overnight</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden" style={{ height: "600px" }}>
            <RouteMap routeData={routeData} />
          </div>
        </div>
      </main>
    </div>
  );
}
