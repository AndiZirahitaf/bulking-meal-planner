import React, { useState } from "react";
import { X, Search, Plus } from "lucide-react";

export default function SelectMenuPopup({
  foodCards,
  selectedCell,
  onAddToSchedule,
  onClose,
  onCreateNew,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredCards = foodCards.filter((card) => {
    // Filter by category
    const categoryMatch =
      selectedCategory === "All" || card.categories.includes(selectedCategory);

    // Filter by search query
    const searchMatch =
      searchQuery === "" ||
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.ingredients.some((ing) =>
        ing.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return categoryMatch && searchMatch;
  });

  // Get unique categories from all food cards
  const allCategories = [
    ...new Set(foodCards.flatMap((card) => card.categories)),
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Pilih Menu</h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedCell &&
                `Menambahkan ke ${selectedCell.mealType} - ${new Date(
                  selectedCell.date
                ).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 border-b bg-gray-50">
          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Search Bar */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Cari menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-medium"
              >
                <option value="All">Semua Kategori</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Create New Menu Button */}
          <button
            onClick={onCreateNew}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
          >
            <Plus size={18} />
            Buat Menu Baru
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {foodCards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                Belum ada menu tersedia
              </p>
              <button
                onClick={onCreateNew}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
              >
                <Plus size={18} />
                Buat Menu Pertama
              </button>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Tidak ada menu yang sesuai dengan pencarian
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => onAddToSchedule(card)}
                  className="bg-white border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-orange-500 hover:shadow-lg transition-all"
                >
                  <div className="mb-2">
                    <h4 className="font-semibold text-lg text-gray-800 mb-2">
                      {card.name}
                    </h4>
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
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-bold">
                      {Math.round(card.calories)} kkal
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 mt-3 border-t pt-2">
                    <div className="font-medium text-gray-700 mb-1">Bahan:</div>
                    {card.ingredients.slice(0, 3).map((ing, i) => (
                      <div key={i}>
                        • {ing.amount} {ing.unit} {ing.name}
                      </div>
                    ))}
                    {card.ingredients.length > 3 && (
                      <div className="text-gray-400 mt-1">
                        +{card.ingredients.length - 3} bahan lainnya
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
