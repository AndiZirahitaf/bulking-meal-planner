import React, { useState } from "react";
import { Plus, Search, Database } from "lucide-react";
import { MEAL_TYPES } from "../constants";
import IngredientDatabasePopup from "./IngredientDatabasePopup";
import MenuFormPopup from "./MenuFormPopup";
import FoodCard from "./FoodCard";

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
  const [showIngredientDB, setShowIngredientDB] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const deleteCard = (cardId) => {
    if (confirm("Yakin ingin menghapus menu ini?")) {
      setFoodCards(foodCards.filter((c) => c.id !== cardId));
    }
  };

  const handleSaveCard = (cardData) => {
    const card = {
      id: editingCard?.id || Date.now(),
      ...cardData,
      calories: calculateCardCalories(cardData.ingredients),
    };

    if (editingCard) {
      setFoodCards(foodCards.map((c) => (c.id === editingCard.id ? card : c)));
      updateScheduleCard(card);
    } else {
      setFoodCards([...foodCards, card]);
    }

    setShowMenuForm(false);
    setEditingCard(null);
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setShowMenuForm(true);
  };

  const handleCreateNew = () => {
    setEditingCard(null);
    setShowMenuForm(true);
  };

  // Filter cards
  const filteredCards = foodCards.filter((card) => {
    const matchesSearch = card.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const groupedCards = MEAL_TYPES.reduce((acc, category) => {
    acc[category] = filteredCards.filter((card) => card.category === category);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Menu Makanan</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowIngredientDB(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            <Database size={20} />
            Database Bahan
          </button>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            <Plus size={20} />
            Buat Menu Baru
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
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
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="All">Semua Kategori</option>
          {MEAL_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Food Cards - Horizontal Scrollable Categories */}
      <div className="space-y-6">
        {MEAL_TYPES.map((category) => {
          const cards = groupedCards[category];
          if (cards.length === 0) return null;

          return (
            <div key={category}>
              <h3 className="font-bold text-lg text-gray-700 mb-3 border-b-2 border-orange-200 pb-2">
                {category} ({cards.length})
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {cards.map((card) => (
                  <FoodCard
                    key={card.id}
                    card={card}
                    onDragStart={() => handleDragStart(card)}
                    onEdit={() => handleEditCard(card)}
                    onDelete={() => deleteCard(card.id)}
                    onClick={() => setSelectedCard(card)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Popups */}
      {showIngredientDB && (
        <IngredientDatabasePopup
          ingredientDatabase={ingredientDatabase}
          setIngredientDatabase={setIngredientDatabase}
          onClose={() => setShowIngredientDB(false)}
        />
      )}

      {showMenuForm && (
        <MenuFormPopup
          editingCard={editingCard}
          ingredientDatabase={ingredientDatabase}
          onSave={handleSaveCard}
          onClose={() => {
            setShowMenuForm(false);
            setEditingCard(null);
          }}
        />
      )}
    </div>
  );
}
