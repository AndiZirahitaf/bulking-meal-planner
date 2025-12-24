import React from "react";
import { X, Plus } from "lucide-react";
import { MEAL_TYPES } from "../constants";

export default function ScheduleGrid({
  dates,
  schedule,
  handleDragOver,
  handleDrop,
  removeFromSchedule,
  getDailyCalories,
  setSelectedCard,
  onCellClick,
  draggedCard,
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 sticky left-0 z-20 bg-white py-2">
        Jadwal Makan
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-orange-100 p-3 text-left font-bold sticky left-0 z-20">
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
                    onClick={() => onCellClick(date, mealType)}
                    className="border border-gray-300 p-2 bg-white min-h-[100px] align-top cursor-pointer hover:bg-orange-50 relative group transition-colors"
                  >
                    {/* Hover indicator */}
                    {(!schedule[date]?.[mealType] ||
                      schedule[date][mealType].length === 0) && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="flex items-center gap-1 text-orange-500 text-sm font-medium">
                          <Plus size={16} />
                          Tambah Menu
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {schedule[date]?.[mealType]?.map((card) => (
                        <div
                          key={card.id}
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            const cardElement = e.currentTarget;
                            cardElement.style.opacity = "0.5";

                            // Create drag image
                            const dragImage = cardElement.cloneNode(true);
                            dragImage.style.position = "absolute";
                            dragImage.style.transform = "rotate(-20deg)";
                            dragImage.style.top = "-1000px";
                            dragImage.style.width =
                              cardElement.offsetWidth + "px";
                            document.body.appendChild(dragImage);

                            e.dataTransfer.setDragImage(
                              dragImage,
                              cardElement.offsetWidth / 2,
                              cardElement.offsetHeight / 2
                            );

                            setTimeout(
                              () => document.body.removeChild(dragImage),
                              0
                            );

                            // Remove card from current position
                            removeFromSchedule(date, mealType, card.id);
                          }}
                          onDragEnd={(e) => {
                            e.currentTarget.style.opacity = "1";
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCard(card);
                          }}
                          className="bg-orange-50 border border-orange-200 rounded p-2 text-sm relative group/card cursor-move hover:bg-orange-100 transition-all hover:shadow-md"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromSchedule(date, mealType, card.id);
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover/card:opacity-100 transition z-10"
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
    </div>
  );
}
