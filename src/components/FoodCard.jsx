import React from "react";
import { Edit, Trash2 } from "lucide-react";

export default function FoodCard({
  card,
  onDragStart,
  onEdit,
  onDelete,
  onClick,
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="min-w-[240px] bg-white border-2 border-orange-200 rounded-lg p-4 cursor-move hover:shadow-lg transition relative flex-shrink-0"
    >
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Edit size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="pr-16 mb-2">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-base">{card.name}</h3>
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {card.categories.map((cat) => (
            <span
              key={cat}
              className="inline-block px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs font-medium"
            >
              {cat}
            </span>
          ))}
        </div>
        <span className="inline-block px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold">
          {Math.round(card.calories)} kkal
        </span>
      </div>

      <div className="text-xs text-gray-600 mt-2">
        {card.ingredients.slice(0, 2).map((ing, i) => (
          <div key={i}>
            • {ing.amount} {ing.unit} {ing.name}
          </div>
        ))}
        {card.ingredients.length > 2 && (
          <div className="text-gray-400">
            +{card.ingredients.length - 2} bahan lainnya
          </div>
        )}
      </div>
    </div>
  );
}
