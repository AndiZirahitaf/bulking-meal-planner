import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { MEAL_TYPES } from "../constants";

export default function MenuFormPopup({
  editingCard,
  ingredientDatabase,
  onSave,
  onClose,
}) {
  const [formData, setFormData] = useState({
    name: "",
    category: "Breakfast",
    ingredients: [{ name: "", amount: "", unit: "" }],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingCard) {
      setFormData({
        name: editingCard.name,
        category: editingCard.category,
        ingredients: [...editingCard.ingredients],
      });
    }
  }, [editingCard]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama makanan harus diisi";
    }

    const validIngredients = formData.ingredients.filter(
      (ing) => ing.name && ing.amount
    );

    if (validIngredients.length === 0) {
      newErrors.ingredients =
        "Minimal harus ada 1 bahan dengan nama dan jumlah terisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        { name: "", amount: "", unit: "" },
      ],
    });
  };

  const updateIngredient = (index, field, value) => {
    const updated = [...formData.ingredients];
    updated[index][field] = value;

    if (field === "name" && value) {
      const ingredient = ingredientDatabase[value.toLowerCase()];
      if (ingredient) {
        updated[index].unit = ingredient.unit;
      }
    }

    setFormData({ ...formData, ingredients: updated });
  };

  const removeIngredient = (index) => {
    const updated = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: updated });
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    onSave({
      name: formData.name,
      category: formData.category,
      ingredients: formData.ingredients.filter((i) => i.name && i.amount),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-2xl font-bold text-gray-800">
            {editingCard ? "Edit Menu" : "Buat Menu Baru"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Nama Makanan */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Makanan
            </label>
            <input
              type="text"
              placeholder="contoh: Avocado Toast"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Kategori */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {MEAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Bahan-bahan */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bahan-bahan
            </label>
            <div className="space-y-2 mb-3">
              {formData.ingredients.map((ing, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    value={ing.name}
                    onChange={(e) =>
                      updateIngredient(index, "name", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Pilih bahan...</option>
                    {Object.keys(ingredientDatabase)
                      .sort()
                      .map((ingredient) => (
                        <option key={ingredient} value={ingredient}>
                          {ingredient.charAt(0).toUpperCase() +
                            ingredient.slice(1)}
                        </option>
                      ))}
                  </select>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Jumlah"
                    value={ing.amount}
                    onChange={(e) =>
                      updateIngredient(index, "amount", e.target.value)
                    }
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={ing.unit}
                    readOnly
                    placeholder="Satuan"
                    className="w-28 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm"
                  />
                  <button
                    onClick={() => removeIngredient(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            {errors.ingredients && (
              <p className="text-red-500 text-sm mb-2">{errors.ingredients}</p>
            )}
            <button
              onClick={addIngredient}
              className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              <Plus size={16} />
              Tambah Bahan
            </button>
          </div>
        </div>

        <div className="p-6 border-t flex gap-3">
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
          >
            {editingCard ? "Update Menu" : "Simpan Menu"}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
