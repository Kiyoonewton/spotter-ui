"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download, ArrowLeft, Map } from "lucide-react";
import GraphWrapper from "@/components/GraphComponent/components/GraphWrapper";
import { RouteWithStops, NewDailyLogSheet } from "../types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function EldLogsPage() {
  const router = useRouter();
  const [routeData, setRouteData] = useState<RouteWithStops | null>(null);
  const [activeLog, setActiveLog] = useState<number>(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  const logs = routeData?.eldLogs;
  const currentLog = logs?.[activeLog] as unknown as NewDailyLogSheet;
  console.log("====================================");
  console.log(currentLog, "----->");
  console.log("====================================");
  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);

      // Wait for rendering to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Get the content area with the GraphWrapper
      const contentArea = document.querySelector(".flex-1.overflow-auto");
      if (!contentArea) {
        throw new Error("Could not find content area");
      }

      // Store scroll position
      const originalScrollTop = contentArea.scrollTop;

      // Scroll to top for complete capture
      contentArea.scrollTop = 0;

      // Wait for scroll
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Capture the scrollable content
      const canvas = await html2canvas(contentArea as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
        windowHeight: (contentArea as HTMLElement).scrollHeight,
      });

      // Restore scroll position
      contentArea.scrollTop = originalScrollTop;

      // Create PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight,
      );
      heightLeft -= pageHeight;

      // Add more pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          0,
          position,
          imgWidth,
          imgHeight,
        );
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const date = currentLog
        ? new Date(currentLog.date).toLocaleDateString().replace(/\//g, "-")
        : "eld-log";
      pdf.save(`eld-log-${date}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to generate PDF: ${errorMessage}. Please try again.`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!routeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#4169E1] text-white py-4 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <button
              onClick={() => router.push("/")}
              className="flex items-center text-white hover:text-gray-200 transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 className="text-2xl md:text-3xl font-bold w-full text-center  ">
              ELD Trip Planner - Logs
            </h1>
          </div>
        </div>
      </header>

      <main>
        <div
          id="eld-modal-content"
          className="bg-white rounded-lg shadow-xl w-full h-full flex flex-col"
        >
          <div className="flex justify-between items-center p-4 sm:p-6 border-b mx-[5%]">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-center">
                Daily Electronic Log Sheets
              </h2>

              <div className="flex mt-4 overflow-x-auto pb-2 justify-center w-full">
                {logs?.map((log, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveLog(index)}
                    className={`px-4 py-2 rounded-md mr-2 text-sm font-medium whitespace-nowrap
                      ${
                        activeLog === index
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                  >
                    {new Date(log.date).toLocaleDateString()}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push("/map")}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                <Map className="w-4 h-4 mr-2" />
                View Map
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
              >
                {isGeneratingPdf ? (
                  <>
                    <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 sm:p-6">
            {currentLog && <GraphWrapper logs={currentLog} />}
          </div>

          {/* <div className="flex justify-end items-center p-4 sm:p-6 border-t">
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Back to Home
            </button>
          </div> */}
        </div>
      </main>
    </div>
  );
}
