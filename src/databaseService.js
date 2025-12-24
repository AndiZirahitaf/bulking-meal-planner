import { supabase } from "./supabaseClient";

// ==================== INGREDIENT DATABASE ====================

export const getAllIngredients = async () => {
  const { data, error } = await supabase
    .from("ingredient_database")
    .select("*")
    .order("name");

  if (error) throw error;

  // Convert to object format { name: { calories, unit } }
  const ingredientObj = {};
  data.forEach((ing) => {
    ingredientObj[ing.name.toLowerCase()] = {
      calories: ing.calories,
      unit: ing.unit,
    };
  });
  return ingredientObj;
};

export const addIngredient = async (name, calories, unit) => {
  const { data, error } = await supabase
    .from("ingredient_database")
    .insert([
      {
        name: name.toLowerCase(),
        calories: parseFloat(calories),
        unit,
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
};

export const deleteIngredient = async (name) => {
  const { error } = await supabase
    .from("ingredient_database")
    .delete()
    .eq("name", name.toLowerCase());

  if (error) throw error;
};

// ==================== FOOD CARDS ====================

export const getAllFoodCards = async () => {
  const { data, error } = await supabase
    .from("food_cards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const addFoodCard = async (card) => {
  const { data, error } = await supabase
    .from("food_cards")
    .insert([
      {
        name: card.name,
        categories: card.categories,
        ingredients: card.ingredients,
        calories: card.calories,
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
};

export const updateFoodCard = async (id, card) => {
  const { data, error } = await supabase
    .from("food_cards")
    .update({
      name: card.name,
      categories: card.categories,
      ingredients: card.ingredients,
      calories: card.calories,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
};

export const deleteFoodCard = async (id) => {
  const { error } = await supabase.from("food_cards").delete().eq("id", id);

  if (error) throw error;
};

// ==================== SCHEDULES ====================

export const getSchedulesByDateRange = async (startDate, endDate) => {
  const { data, error } = await supabase
    .from("schedules")
    .select(
      `
      *,
      food_cards (*)
    `
    )
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) throw error;

  // Convert to schedule object format
  const scheduleObj = {};
  data.forEach((item) => {
    const dateStr = item.date;
    if (!scheduleObj[dateStr]) scheduleObj[dateStr] = {};
    if (!scheduleObj[dateStr][item.meal_type])
      scheduleObj[dateStr][item.meal_type] = [];

    scheduleObj[dateStr][item.meal_type].push({
      id: item.food_cards.id,
      name: item.food_cards.name,
      categories: item.food_cards.categories,
      ingredients: item.food_cards.ingredients,
      calories: item.food_cards.calories,
    });
  });

  return scheduleObj;
};

export const addToSchedule = async (date, mealType, foodCardId) => {
  const { data, error } = await supabase
    .from("schedules")
    .insert([
      {
        date,
        meal_type: mealType,
        food_card_id: foodCardId,
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
};

export const removeFromSchedule = async (date, mealType, foodCardId) => {
  const { error } = await supabase
    .from("schedules")
    .delete()
    .eq("date", date)
    .eq("meal_type", mealType)
    .eq("food_card_id", foodCardId);

  if (error) throw error;
};

export const removeCardFromAllSchedules = async (
  foodCardId,
  mealTypes = null
) => {
  let query = supabase
    .from("schedules")
    .delete()
    .eq("food_card_id", foodCardId);

  if (mealTypes && mealTypes.length > 0) {
    query = query.in("meal_type", mealTypes);
  }

  const { error } = await query;
  if (error) throw error;
};
