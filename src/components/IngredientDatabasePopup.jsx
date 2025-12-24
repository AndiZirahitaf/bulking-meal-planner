import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import * as db from "../databaseService";

export default function IngredientDatabasePopup({
  ingredientDatabase,
  setIngredientDatabase,
  onClose,
}) {
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    calories: "",
    unit: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const addIngredient = async () => {
    if (!newIngredient.name || !newIngredient.calories || !newIngredient.unit) {
      setError("Semua field harus diisi");
      return;
    }

    if (ingredientDatabase[newIngredient.name.toLowerCase()]) {
      setError("Bahan sudah ada dalam database");
      return;
    }

    try {
      setLoading(true);

      // Add to database
      await db.addIngredient(
        newIngredient.name,
        newIngredient.calories,
        newIngredient.unit
      );

      // Update local state
      setIngredientDatabase({
        ...ingredientDatabase,
        [newIngredient.name.toLowerCase()]: {
          calories: parseFloat(newIngredient.calories),
          unit: newIngredient.unit,
        },
      });

      setNewIngredient({ name: "", calories: "", unit: "" });
      setError("");
      setLoading(false);
    } catch (error) {
      console.error("Error adding ingredient:", error);
      setError("Gagal menambahkan bahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  const deleteIngredient = async (name) => {
    if (confirm(`Yakin ingin menghapus bahan "${name}"?`)) {
      try {
        setLoading(true);

        // Delete from database
        await db.deleteIngredient(name);

        // Update local state
        const updated = { ...ingredientDatabase };
        delete updated[name];
        setIngredientDatabase(updated);

        setLoading(false);
      } catch (error) {
        console.error("Error deleting ingredient:", error);
        alert("Gagal menghapus bahan. Silakan coba lagi.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-2xl font-bold text-gray-800">
            Database Bahan Makanan
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Add New Ingredient Form */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 border-2 border-blue-200">
            <h4 className="font-bold text-lg mb-3">Tambah Bahan Baru</h4>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-3">
                {error}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Bahan
                </label>
                <input
                  type="text"
                  placeholder="contoh: daun bawang"
                  value={newIngredient.name}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kalori
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="contoh: 32"
                  value={newIngredient.calories}
                  onChange={(e) =>
                    setNewIngredient({
                      ...newIngredient,
                      calories: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Satuan
                </label>
                <input
                  type="text"
                  placeholder="contoh: 100g"
                  value={newIngredient.unit}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, unit: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              onClick={addIngredient}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              {loading ? "Menambahkan..." : "Tambah Bahan"}
            </button>
          </div>

          {/* Ingredients List */}
          <div>
            <h4 className="font-bold text-lg mb-3">
              Daftar Bahan ({Object.keys(ingredientDatabase).length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(ingredientDatabase)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([name, data]) => (
                  <div
                    key={name}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                  >
                    <div>
                      <span className="font-medium capitalize">{name}</span>
                      <div className="text-sm text-gray-600">
                        {data.calories} kkal per {data.unit}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteIngredient(name)}
                      disabled={loading}
                      className="p-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
