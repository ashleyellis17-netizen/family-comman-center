import type { GroceryCategory } from '@/lib/grocery-types';
import type { Ingredient } from '@/lib/food-types';

const UNITS = new Map<string, string>([
  ['cup', 'cup'], ['cups', 'cup'], ['c', 'cup'],
  ['tbsp', 'tbsp'], ['tablespoon', 'tbsp'], ['tablespoons', 'tbsp'],
  ['tsp', 'tsp'], ['teaspoon', 'tsp'], ['teaspoons', 'tsp'],
  ['lb', 'lb'], ['lbs', 'lb'], ['pound', 'lb'], ['pounds', 'lb'],
  ['oz', 'oz'], ['ounce', 'oz'], ['ounces', 'oz'],
  ['g', 'g'], ['gram', 'g'], ['grams', 'g'], ['kg', 'kg'],
  ['ml', 'ml'], ['l', 'l'], ['liter', 'l'], ['liters', 'l'],
  ['can', 'can'], ['cans', 'can'], ['jar', 'jar'], ['jars', 'jar'],
  ['box', 'box'], ['boxes', 'box'], ['bag', 'bag'], ['bags', 'bag'],
  ['package', 'pkg'], ['packages', 'pkg'], ['pkg', 'pkg'],
  ['clove', 'clove'], ['cloves', 'clove'], ['bunch', 'bunch'], ['bunches', 'bunch'],
  ['loaf', 'loaf'], ['dozen', 'dozen'], ['gal', 'gal'], ['gallon', 'gal'],
  ['pinch', 'pinch'], ['slice', 'slice'], ['slices', 'slice'],
]);

const WORD_NUMBERS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12, half: 0.5,
};

function parseAmount(token: string): number | null {
  if (/^\d+(\.\d+)?$/.test(token)) return Number(token);
  const frac = token.match(/^(\d+)\/(\d+)$/);
  if (frac && Number(frac[2]) > 0) return Number(frac[1]) / Number(frac[2]);
  const word = WORD_NUMBERS[token.toLowerCase()];
  return word ?? null;
}

function formatAmount(n: number): string {
  return String(Math.round(n * 100) / 100);
}

/** "2 lb chicken thighs" -> { quantity: "2", unit: "lb", name: "chicken thighs" }. */
export function parseIngredientLine(raw: string): Ingredient | null {
  const line = raw.replace(/^[-*•\s]+/, '').replace(/\s+/g, ' ').trim();
  if (!line) return null;
  const tokens = line.split(' ');
  let i = 0;
  let amount: number | null = null;

  // Leading amount, including mixed numbers like "1 1/2".
  const first = tokens[i] ? parseAmount(tokens[i]) : null;
  if (first !== null && tokens.length > 1) {
    amount = first;
    i++;
    const second = tokens[i] && /^\d+\/\d+$/.test(tokens[i]) ? parseAmount(tokens[i]) : null;
    if (second !== null) {
      amount += second;
      i++;
    }
  }

  let unit: string | null = null;
  const unitToken = tokens[i]?.toLowerCase().replace(/\.$/, '');
  if (amount !== null && unitToken && UNITS.has(unitToken) && tokens.length > i + 1) {
    unit = UNITS.get(unitToken)!;
    i++;
    if (tokens[i]?.toLowerCase() === 'of') i++;
  }

  const name = tokens.slice(i).join(' ').trim().slice(0, 80);
  if (!name) return null;
  return { name, quantity: amount !== null ? formatAmount(amount) : null, unit };
}

export function parseIngredientText(text: string): Ingredient[] {
  return text
    .split(/\r?\n|,(?![^(]*\))/)
    .map(parseIngredientLine)
    .filter((x): x is Ingredient => x !== null)
    .slice(0, 60);
}

export function ingredientToLine(ing: Ingredient): string {
  return [ing.quantity, ing.unit, ing.name].filter(Boolean).join(' ');
}

export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ').replace(/(es|s)$/, '');
}

const CATEGORY_HINTS: [GroceryCategory, RegExp][] = [
  ['Produce', /\b(apple|banana|berr|lettuce|spinach|onion|garlic|tomato|potato|carrot|pepper|lemon|lime|avocado|cucumber|broccoli|celery|herb|cilantro|parsley|basil|fruit|vegetable|mushroom|zucchini|kale|ginger|corn)/],
  ['Dairy & Eggs', /\b(milk|cheese|butter|yogurt|cream|egg)/],
  ['Meat & Seafood', /\b(chicken|beef|pork|turkey|bacon|sausage|salmon|shrimp|fish|steak|ham|ground)/],
  ['Bakery', /\b(bread|bun|roll|tortilla|bagel|pita|naan)/],
  ['Frozen', /\bfrozen\b/],
  ['Drinks', /\b(juice|soda|coffee|tea|water)\b/],
];

export function guessCategory(name: string): GroceryCategory {
  const n = name.toLowerCase();
  for (const [category, re] of CATEGORY_HINTS) if (re.test(n)) return category;
  return 'Pantry';
}
