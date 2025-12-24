import React from "react";
import { X } from "lucide-react";
import { MEAL_TYPES } from "../constants";

export default function ScheduleGrid({
  dates,
  schedule,
  handleDragOver,
  handleDrop,
  removeFromSchedule,
  getDailyCalories,
  setSelectedCard,
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Jadwal Makan</h2>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-gray-300 bg-orange-100 p-3 text-left font-bold sticky left-0 z-10">
              Waktu Makan
            </th>
            {dates.map((date) => (
              <th
                key={date}
                className="border border-gray-300 bg-orange-100 p-3 min-w-[200px]"
              >
                <div className="font-bold">
                  {new Date(date).toLocaleDateString("id-ID", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </div>
                <div className="text-sm font-normal text-orange-600 mt-1">
                  Total: {Math.round(getDailyCalories(date))} kkal
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MEAL_TYPES.map((mealType) => (
            <tr key={mealType}>
              <td className="border border-gray-300 bg-gray-50 p-3 font-semibold sticky left-0 z-10">
                {mealType}
              </td>
              {dates.map((date) => (
                <td
                  key={`${date}-${mealType}`}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(date, mealType)}
                  className="border border-gray-300 p-2 bg-white min-h-[100px] align-top"
                >
                  <div className="space-y-2">
                    {schedule[date]?.[mealType]?.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => setSelectedCard(card)}
                        className="bg-orange-50 border border-orange-200 rounded p-2 text-sm relative group cursor-pointer hover:bg-orange-100"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromSchedule(date, mealType, card.id);
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={12} />
                        </button>
                        <div className="font-semibold pr-6">{card.name}</div>
                        <div className="text-orange-600 font-bold">
                          {Math.round(card.calories)} kkal
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
