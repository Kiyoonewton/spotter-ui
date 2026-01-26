"use client";
import React from "react";
import ShippingRemarksForm from "@/components/ShippingRemarksForm";
import DriverHoursGrid from "@/components/DriverHoursGrid";
import GraphComponent from "./GraphComponent";
import { NewDailyLogSheet } from "@/app/types";

const GraphWrapper = ({ logs }: { logs: NewDailyLogSheet }) => {
  const shippingData = {
    documentNumber: logs.truckNumber,
    carrier: logs.carrier || "",
    remarks: logs.remarks,
    licensePlate: logs.licensePlate,
    totalMilesDrivingToday: logs.totalMilesDrivingToday,
    totalMileageToday: logs.totalMileageToday,
    carrierName: logs.driverName,
    officeAddress: logs.officeAddress,
    homeAddress: logs.homeAddress,
  };

  const date = new Date(logs.date);

  return (
    <main style={{ width: "100%", maxWidth: "80%", margin: "80px auto" }}>
      {/* Header Section - Redesigned */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 mb-20 border border-blue-100">
        {/* Top Row: Title and Date */}
        <div className="flex items-center justify-between mb-6">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Driver&apos;s Daily Log
              </h1>
              <p className="text-sm text-gray-600">24-Hour Period</p>
            </div>
          </div>

          {/* Date Display - Modernized */}
          <div className="flex items-center gap-2 bg-white rounded-lg px-6 py-3 shadow-md border border-blue-200">
            <div className="flex items-center gap-1">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-2xl font-bold text-blue-600">
                {date.toLocaleString("en-US", { month: "short" })}{" "}
                {date.getDate()}, {date.getFullYear()}
              </span>
            </div>
          </div>
        </div>

        {/* Route Information & Mileage */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Origin
              </span>
            </div>
            <p className="text-lg font-semibold text-gray-800 truncate">
              {logs.startLocation || "Not specified"}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Destination
              </span>
            </div>
            <p className="text-lg font-semibold text-gray-800 truncate">
              {logs.endLocation || "Not specified"}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Miles Today
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {logs.totalMilesDrivingToday || "0"}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-4 h-4 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Total Mileage
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {logs.totalMileageToday || "0"}
            </p>
          </div>
        </div>

        {/* Odometer Information */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Beginning Odometer
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {logs.startOdometer?.toLocaleString() || "0"}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-4 h-4 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Ending Odometer
              </span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {logs.endOdometer?.toLocaleString() || "0"}
            </p>
          </div>
        </div>

        {/* Carrier and Vehicle Information */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-4 h-4 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Carrier
              </span>
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {shippingData.carrier || "Not specified"}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                License Plate
              </span>
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {shippingData.licensePlate || "Not specified"}
            </p>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-4 h-4 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Main Office Address
              </span>
            </div>
            <p className="text-base text-gray-800">
              {shippingData.officeAddress || "Not specified"}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-4 h-4 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Home Terminal Address
              </span>
            </div>
            <p className="text-base text-gray-800">
              {shippingData.homeAddress || "Not specified"}
            </p>
          </div>
        </div>

        {/* Compliance Notice */}
        <div className="bg-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm">
              <p className="font-semibold mb-1">
                Record Retention Requirements
              </p>
              <p className="text-blue-100">
                <span className="font-medium">Original:</span> File at home
                terminal &bull; <span className="font-medium">Duplicate:</span>{" "}
                Driver retains for 8 consecutive days
              </p>
            </div>
          </div>
        </div>
      </div>
      {logs && <GraphComponent graphData={logs.graphData} />}

      <ShippingRemarksForm shippingData={shippingData} className="mb-8 mt-20" />
      <DriverHoursGrid recap={logs.recap} />
    </main>
  );
};

export default GraphWrapper;
