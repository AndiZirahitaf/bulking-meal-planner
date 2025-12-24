import React, { useState } from "react";
import { Plus, Database, Search } from "lucide-react";
import FoodCard from "./FoodCard";
import MenuFormPopup from "./MenuFormPopup";
import IngredientDatabasePopup from "./IngredientDatabasePopup";
import { MEAL_TYPES } from "../constants";

export default function MenuLibrary({
  foodCards,
  setFoodCards,
  ingredientDatabase,
  setIngredientDatabase,
  calculateCardCalories,
  handleDragStart,
  setSelectedCard,
  updateScheduleCard,
}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showIngredientDb, setShowIngredientDb] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  const handleSaveCard = (cardData) => {
    const calories = calculateCardCalories(cardData.ingredients);

    if (editingCard) {
      // Check if categories have changed
      const oldCategories = editingCard.categories || [];
      const newCategories = cardData.categories || [];

      const removedCategories = oldCategories.filter(
        (cat) => !newCategories.includes(cat)
      );

      if (removedCategories.length > 0) {
        // Check if this menu exists in schedule for the removed categories
        const affectedLocations = [];

        // Scan the schedule - this requires passing schedule as prop
        // We'll need to update this component to receive schedule
        // For now, show a warning
        const confirmMessage =
          `Kategori berikut akan dihapus: ${removedCategories.join(
            ", "
          )}.\n\n` +
          `Menu "${
            editingCard.name
          }" akan dihapus dari semua jadwal dengan waktu makan: ${removedCategories.join(
            ", "
          )}.\n\n` +
          `Apakah Anda yakin ingin melanjutkan?`;

        if (!confirm(confirmMessage)) {
          return; // Cancel the update
        }
      }

      const updatedCard = {
        ...editingCard,
        name: cardData.name,
        categories: cardData.categories,
        ingredients: cardData.ingredients,
        calories,
      };

      setFoodCards(
        foodCards.map((c) => (c.id === editingCard.id ? updatedCard : c))
      );

      // Update schedule and remove from incompatible meal types
      updateScheduleCard(updatedCard, removedCategories);
    } else {
      const newCard = {
        id: Date.now(),
        name: cardData.name,
        categories: cardData.categories,
        ingredients: cardData.ingredients,
        calories,
      };
      setFoodCards([...foodCards, newCard]);
    }

    setShowForm(false);
    setEditingCard(null);
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setShowForm(true);
  };

  const handleDeleteCard = (cardId) => {
    if (confirm("Yakin ingin menghapus menu ini?")) {
      setFoodCards(foodCards.filter((c) => c.id !== cardId));
    }
  };

  const filteredCards = foodCards.filter((card) => {
    // Filter by category
    const categoryMatch =
      activeCategory === "All" || card.categories.includes(activeCategory);

    // Filter by search query
    const searchMatch =
      searchQuery === "" ||
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.ingredients.some((ing) =>
        ing.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return categoryMatch && searchMatch;
  });

  const getCategoryCount = (category) => {
    if (category === "All") {
      return foodCards.length;
    }
    return foodCards.filter((c) => c.categories.includes(category)).length;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Library Menu</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowIngredientDb(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
          >
            <Database size={18} />
            Database Bahan
          </button>
          <button
            onClick={() => {
              setEditingCard(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
          >
            <Plus size={18} />
            Buat Menu Baru
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Search Bar */}
        <div className="relative md:col-span-3">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari menu atau bahan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter Dropdown */}
        <div className="md:col-span-1">
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-medium"
          >
            <option value="All">
              Semua Kategori ({getCategoryCount("All")})
            </option>
            {MEAL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type} ({getCategoryCount(type)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-3 text-sm text-gray-600">
        Menampilkan {filteredCards.length} menu
        {searchQuery && ` untuk "${searchQuery}"`}
        {activeCategory !== "All" && ` di kategori ${activeCategory}`}
      </div>

      {/* Food Cards */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {filteredCards.length === 0 ? (
          <div className="text-gray-500 text-center w-full py-8">
            {searchQuery || activeCategory !== "All"
              ? "Tidak ada menu yang sesuai dengan pencarian atau filter."
              : 'Belum ada menu. Klik "Buat Menu Baru" untuk menambahkan.'}
          </div>
        ) : (
          filteredCards.map((card) => (
            <FoodCard
              key={card.id}
              card={card}
              onDragStart={() => handleDragStart(card)}
              onEdit={() => handleEditCard(card)}
              onDelete={() => handleDeleteCard(card.id)}
              onClick={() => setSelectedCard(card)}
            />
          ))
        )}
      </div>

      {showForm && (
        <MenuFormPopup
          editingCard={editingCard}
          ingredientDatabase={ingredientDatabase}
          onSave={handleSaveCard}
          onClose={() => {
            setShowForm(false);
            setEditingCard(null);
          }}
        />
      )}

      {showIngredientDb && (
        <IngredientDatabasePopup
          ingredientDatabase={ingredientDatabase}
          setIngredientDatabase={setIngredientDatabase}
          onClose={() => setShowIngredientDb(false)}
        />
      )}
    </div>
  );
}
