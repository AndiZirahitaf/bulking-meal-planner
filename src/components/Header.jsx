import React from "react";
import { Calendar } from "lucide-react";

export default function Header({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  totalDays,
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="text-orange-500" />
        Bulking Meal Planner
      </h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal Selesai
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="text-lg font-semibold text-orange-600">
        Total: {totalDays} hari
      </div>
    </div>
  );
}
