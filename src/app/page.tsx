"use client";
import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { TripData, RouteWithStops } from "./types";
import OSMLocationForm from "@/components/CityDropdown";

export default function Home() {
  const router = useRouter();
  const [routeData, setRouteData] = useState<RouteWithStops | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const gotoGraph = () => {
    // Store route data in sessionStorage and navigate to ELD logs page
    if (routeData) {
      sessionStorage.setItem("routeData", JSON.stringify(routeData));
      router.push("/eld-logs");
    }
  };

  const calculateRoute = async (tripData: TripData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/trip/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trip: tripData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to calculate route");
      }

      const data = (await response.json()) as RouteWithStops;
      setRouteData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative ">
      <Head>
        <title>ELD Trip Planner</title>
        <meta
          name="description"
          content="Plan truck routes with ELD log generation"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Dark Overlay */}
      <div className="absolute -z-10 -inset-1 bg-black bg-opacity-55"></div>

      <header className="bg-[#4169E1] text-white py-4 shadow-md ">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold">ELD Trip Planner</h1>
        </div>
      </header>

      <main className="flex h-[80vh] w-full justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-md w-[35vw]">
          <OSMLocationForm
            onCalculate={calculateRoute}
            isRouteData={loading}
            gotoGraph={gotoGraph}
            routeData={routeData}
          />
        </div>

      </main>

      <footer
        className="bg-gray-100 border-t mt-12 py-6 absolute w-full"
        style={{ bottom: 0 }}
      >
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600 text-sm">
            ELD Trip Planner &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
