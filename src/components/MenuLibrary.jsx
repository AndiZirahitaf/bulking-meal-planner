import React, { useState } from "react";
import { Plus, Database, Search } from "lucide-react";
import FoodCard from "./FoodCard";
import MenuFormPopup from "./MenuFormPopup";
import IngredientDatabasePopup from "./IngredientDatabasePopup";
import { MEAL_TYPES } from "../constants";
import * as db from "../databaseService";

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

  const handleSaveCard = async (cardData) => {
    const calories = calculateCardCalories(cardData.ingredients);

    try {
      if (editingCard) {
        // Check if categories have changed
        const oldCategories = editingCard.categories || [];
        const newCategories = cardData.categories || [];

        const removedCategories = oldCategories.filter(
          (cat) => !newCategories.includes(cat)
        );

        if (removedCategories.length > 0) {
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
            return;
          }
        }

        // Update in database
        const updatedCard = await db.updateFoodCard(editingCard.id, {
          name: cardData.name,
          categories: cardData.categories,
          ingredients: cardData.ingredients,
          calories,
        });

        // Update local state
        setFoodCards(
          foodCards.map((c) => (c.id === editingCard.id ? updatedCard : c))
        );

        // Update schedule and remove from incompatible meal types
        updateScheduleCard(updatedCard, removedCategories);
      } else {
        // Add to database
        const newCard = await db.addFoodCard({
          name: cardData.name,
          categories: cardData.categories,
          ingredients: cardData.ingredients,
          calories,
        });

        // Update local state
        setFoodCards([...foodCards, newCard]);
      }

      setShowForm(false);
      setEditingCard(null);
    } catch (error) {
      console.error("Error saving card:", error);
      alert("Gagal menyimpan menu. Silakan coba lagi.");
    }
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setShowForm(true);
  };

  const handleDeleteCard = async (cardId) => {
    if (
      confirm(
        "Yakin ingin menghapus menu ini? Menu akan dihapus dari semua jadwal."
      )
    ) {
      try {
        // Delete from database (cascade will handle schedules)
        await db.deleteFoodCard(cardId);

        // Update local state
        setFoodCards(foodCards.filter((c) => c.id !== cardId));
      } catch (error) {
        console.error("Error deleting card:", error);
        alert("Gagal menghapus menu. Silakan coba lagi.");
      }
    }
  };

  const filteredCards = foodCards.filter((card) => {
    const categoryMatch =
      activeCategory === "All" || card.categories.includes(activeCategory);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="relative">
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

        <div>
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

      <div className="mb-3 text-sm text-gray-600">
        Menampilkan {filteredCards.length} menu
        {searchQuery && ` untuk "${searchQuery}"`}
        {activeCategory !== "All" && ` di kategori ${activeCategory}`}
      </div>

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
