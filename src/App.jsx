import React, { useState, useEffect } from "react";
import { X, LogOut, User } from "lucide-react";
import Header from "./components/Header";
import MenuLibrary from "./components/MenuLibrary";
import ScheduleGrid from "./components/ScheduleGrid";
import SelectMenuPopup from "./components/SelectMenuPopup";
import Auth from "./components/Auth";
import { DEFAULT_INGREDIENTS, MEAL_TYPES } from "./constants";
import { supabase } from "./supabaseClient";
import * as db from "./databaseService";

export default function App() {
  const [user, setUser] = useState(null);
  const [startDate, setStartDate] = useState("2024-12-26");
  const [endDate, setEndDate] = useState("2025-01-03");
  const [foodCards, setFoodCards] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [draggedCard, setDraggedCard] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [ingredientDatabase, setIngredientDatabase] =
    useState(DEFAULT_INGREDIENTS);
  const [showSelectMenuPopup, setShowSelectMenuPopup] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Check user authentication on mount
  useEffect(() => {
    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          loadInitialData();
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        loadInitialData();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error checking user:", error);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setFoodCards([]);
      setSchedule({});
      setIngredientDatabase(DEFAULT_INGREDIENTS);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Load data when dates change
  useEffect(() => {
    if (user && startDate && endDate) {
      loadSchedule();
    }
  }, [startDate, endDate, user]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load ingredients
      const ingredients = await db.getAllIngredients();
      setIngredientDatabase(ingredients);

      // Load food cards
      const cards = await db.getAllFoodCards();
      setFoodCards(cards);

      // Load schedule
      await loadSchedule();

      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Gagal memuat data. Silakan refresh halaman.");
      setLoading(false);
    }
  };

  const loadSchedule = async () => {
    try {
      const scheduleData = await db.getSchedulesByDateRange(startDate, endDate);
      setSchedule(scheduleData);
    } catch (error) {
      console.error("Error loading schedule:", error);
    }
  };

  const dates = (() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split("T")[0]);
    }
    return dates;
  })();

  const calculateCardCalories = (ingredients) => {
    return ingredients.reduce((total, ing) => {
      const ingredient = ingredientDatabase[ing.name.toLowerCase()];
      if (ingredient && ing.amount) {
        return total + ingredient.calories * parseFloat(ing.amount);
      }
      return total;
    }, 0);
  };

  const handleDragStart = (card) => {
    setDraggedCard(card);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (date, mealType) => {
    if (draggedCard) {
      if (!draggedCard.categories.includes(mealType)) {
        alert(`Menu "${draggedCard.name}" tidak memiliki kategori ${mealType}`);
        setDraggedCard(null);
        return;
      }

      try {
        await db.addToSchedule(date, mealType, draggedCard.id);

        const newSchedule = { ...schedule };
        if (!newSchedule[date]) newSchedule[date] = {};
        if (!newSchedule[date][mealType]) newSchedule[date][mealType] = [];

        const exists = newSchedule[date][mealType].find(
          (c) => c.id === draggedCard.id
        );
        if (!exists) {
          newSchedule[date][mealType].push(draggedCard);
        }

        setSchedule(newSchedule);
        setDraggedCard(null);
      } catch (error) {
        console.error("Error adding to schedule:", error);
        alert("Gagal menambahkan ke jadwal");
      }
    }
  };

  const removeFromSchedule = async (date, mealType, cardId) => {
    try {
      await db.removeFromSchedule(date, mealType, cardId);

      const newSchedule = { ...schedule };
      newSchedule[date][mealType] = newSchedule[date][mealType].filter(
        (c) => c.id !== cardId
      );
      setSchedule(newSchedule);
    } catch (error) {
      console.error("Error removing from schedule:", error);
      alert("Gagal menghapus dari jadwal");
    }
  };

  const getDailyCalories = (date) => {
    if (!schedule[date]) return 0;
    let total = 0;
    Object.values(schedule[date]).forEach((meals) => {
      meals.forEach((meal) => {
        total += meal.calories;
      });
    });
    return total;
  };

  const updateScheduleCard = async (updatedCard, removedCategories = []) => {
    try {
      if (removedCategories.length > 0) {
        await db.removeCardFromAllSchedules(updatedCard.id, removedCategories);
      }

      const newSchedule = { ...schedule };
      Object.keys(newSchedule).forEach((date) => {
        Object.keys(newSchedule[date]).forEach((mealType) => {
          if (removedCategories.includes(mealType)) {
            newSchedule[date][mealType] = newSchedule[date][mealType].filter(
              (c) => c.id !== updatedCard.id
            );
          } else {
            newSchedule[date][mealType] = newSchedule[date][mealType].map((c) =>
              c.id === updatedCard.id ? updatedCard : c
            );
          }
        });
      });
      setSchedule(newSchedule);
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  const handleCellClick = (date, mealType) => {
    setSelectedCell({ date, mealType });
    setShowSelectMenuPopup(true);
  };

  const handleAddMenuToCell = async (card) => {
    if (!selectedCell) return;

    try {
      await db.addToSchedule(selectedCell.date, selectedCell.mealType, card.id);

      const newSchedule = { ...schedule };
      if (!newSchedule[selectedCell.date]) newSchedule[selectedCell.date] = {};
      if (!newSchedule[selectedCell.date][selectedCell.mealType])
        newSchedule[selectedCell.date][selectedCell.mealType] = [];

      const exists = newSchedule[selectedCell.date][selectedCell.mealType].find(
        (c) => c.id === card.id
      );

      if (!exists) {
        newSchedule[selectedCell.date][selectedCell.mealType].push(card);
      }

      setSchedule(newSchedule);
      setShowSelectMenuPopup(false);
      setSelectedCell(null);
    } catch (error) {
      console.error("Error adding to schedule:", error);
      alert("Gagal menambahkan ke jadwal");
    }
  };

  // Show auth screen if not logged in
  if (!user) {
    return <Auth />;
  }

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* User Menu Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
              {user.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                {user.user_metadata?.full_name || "User"}
              </p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        <Header
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          totalDays={dates.length}
        />

        <MenuLibrary
          foodCards={foodCards}
          setFoodCards={setFoodCards}
          ingredientDatabase={ingredientDatabase}
          setIngredientDatabase={setIngredientDatabase}
          calculateCardCalories={calculateCardCalories}
          handleDragStart={handleDragStart}
          setSelectedCard={setSelectedCard}
          updateScheduleCard={updateScheduleCard}
        />

        <ScheduleGrid
          dates={dates}
          schedule={schedule}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          removeFromSchedule={removeFromSchedule}
          getDailyCalories={getDailyCalories}
          setSelectedCard={setSelectedCard}
          onCellClick={handleCellClick}
          draggedCard={draggedCard}
        />

        {selectedCard && (
          <DetailPopup
            selectedCard={selectedCard}
            setSelectedCard={setSelectedCard}
            ingredientDatabase={ingredientDatabase}
          />
        )}

        {showSelectMenuPopup && (
          <SelectMenuPopup
            foodCards={foodCards}
            selectedCell={selectedCell}
            onAddToSchedule={handleAddMenuToCell}
            onClose={() => {
              setShowSelectMenuPopup(false);
              setSelectedCell(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function DetailPopup({ selectedCard, setSelectedCard, ingredientDatabase }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              {selectedCard.name}
            </h3>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedCard.categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-block px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setSelectedCard(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-bold text-lg mb-2 text-gray-700">Bahan-bahan:</h4>
          <div className="space-y-2">
            {selectedCard.ingredients.map((ing, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
              >
                <span className="font-medium">{ing.name}</span>
                <span className="text-gray-600">
                  {ing.amount} {ing.unit}
                  <span className="ml-2 text-orange-600 font-semibold">
                    (
                    {Math.round(
                      ingredientDatabase[ing.name.toLowerCase()].calories *
                        parseFloat(ing.amount)
                    )}{" "}
                    kkal)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total Kalori:</span>
            <span className="text-orange-600">
              {Math.round(selectedCard.calories)} kkal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
