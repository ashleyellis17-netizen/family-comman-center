export const GROCERY_CATEGORIES = [
  'Produce',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Bakery',
  'Pantry',
  'Frozen',
  'Beverages',
  'Snacks',
  'Household',
  'Personal Care',
  'Other',
] as const

const CATEGORY_KEYWORDS: [string, string[]][] = [
  ['Household', ['detergent', 'paper towel', 'toilet paper', 'trash bag', 'dish soap', 'sponge', 'bleach', 'cleaner', 'foil', 'plastic wrap', 'napkin', 'batteries', 'light bulb', 'dryer sheet', 'wipes', 'filter']],
  ['Personal Care', ['shampoo', 'conditioner', 'toothpaste', 'toothbrush', 'deodorant', 'soap', 'lotion', 'floss', 'razor', 'sunscreen', 'tissue']],
  ['Produce', ['apple', 'banana', 'lettuce', 'tomato', 'onion', 'garlic', 'potato', 'carrot', 'pepper', 'spinach', 'berry', 'berries', 'grape', 'lemon', 'lime', 'avocado', 'cucumber', 'broccoli', 'celery', 'orange', 'cilantro', 'parsley', 'basil', 'ginger', 'mushroom', 'zucchini', 'corn', 'fruit', 'salad', 'kale', 'peach']],
  ['Dairy & Eggs', ['milk', 'cheese', 'yogurt', 'butter', 'egg', 'cream', 'sour cream', 'cheddar', 'mozzarella', 'parmesan']],
  ['Meat & Seafood', ['chicken', 'beef', 'pork', 'turkey', 'bacon', 'sausage', 'salmon', 'shrimp', 'fish', 'steak', 'ham', 'lamb', 'tuna', 'ground']],
  ['Bakery', ['bread', 'bun', 'bagel', 'tortilla', 'muffin', 'roll', 'croissant', 'pita']],
  ['Frozen', ['frozen', 'ice cream', 'pizza', 'waffle', 'ice']],
  ['Beverages', ['juice', 'soda', 'coffee', 'tea', 'water', 'sparkling', 'lemonade', 'gatorade']],
  ['Snacks', ['chips', 'cracker', 'cookie', 'granola', 'popcorn', 'pretzel', 'candy', 'snack', 'fruit snack', 'goldfish']],
  ['Pantry', ['rice', 'pasta', 'flour', 'sugar', 'salt', 'oil', 'vinegar', 'sauce', 'cereal', 'oat', 'bean', 'broth', 'stock', 'spice', 'honey', 'peanut butter', 'jam', 'syrup', 'can', 'noodle', 'soy', 'ketchup', 'mustard', 'mayo', 'baking']],
]

export function guessCategory(name: string): string {
  const n = name.toLowerCase()
  for (const [category, words] of CATEGORY_KEYWORDS) {
    if (words.some((w) => n.includes(w))) return category
  }
  return 'Other'
}

/** Comparable form of an item name: lowercase, no punctuation, naive singular. */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((w) => (w.length > 3 && w.endsWith('ies') ? `${w.slice(0, -3)}y` : w.length > 3 && w.endsWith('es') && /(ch|sh|x|o)es$/.test(w) ? w.slice(0, -2) : w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w))
    .join(' ')
}

export function namesMatch(a: string, b: string): boolean {
  const na = normalizeName(a)
  const nb = normalizeName(b)
  if (!na || !nb) return false
  if (na === nb) return true
  // "milk" vs "whole milk": treat a whole-word containment as a possible duplicate
  const wa = ` ${na} `
  const wb = ` ${nb} `
  return wa.includes(wb) || wb.includes(wa)
}

const UNIT_ALIASES: Record<string, string> = {
  tsp: 'tsp', teaspoon: 'tsp', teaspoons: 'tsp',
  tbsp: 'tbsp', tablespoon: 'tbsp', tablespoons: 'tbsp', tbs: 'tbsp',
  cup: 'cup', cups: 'cup', c: 'cup',
  oz: 'oz', ounce: 'oz', ounces: 'oz',
  lb: 'lb', lbs: 'lb', pound: 'lb', pounds: 'lb',
  g: 'g', gram: 'g', grams: 'g', kg: 'kg',
  ml: 'ml', l: 'l', liter: 'l', liters: 'l',
  gallon: 'gallon', gallons: 'gallon', gal: 'gallon',
  quart: 'quart', quarts: 'quart', qt: 'quart',
  pint: 'pint', pints: 'pint',
  can: 'can', cans: 'can', jar: 'jar', jars: 'jar',
  bag: 'bag', bags: 'bag', box: 'box', boxes: 'box',
  pack: 'pack', packs: 'pack', package: 'pack', packages: 'pack',
  bottle: 'bottle', bottles: 'bottle', bunch: 'bunch', bunches: 'bunch',
  clove: 'clove', cloves: 'clove', slice: 'slice', slices: 'slice',
  dozen: 'dozen', loaf: 'loaf', loaves: 'loaf', head: 'head', heads: 'head',
  roll: 'roll', rolls: 'roll', stick: 'stick', sticks: 'stick', pinch: 'pinch',
}

export function normalizeUnit(unit: string | null | undefined): string | null {
  if (!unit) return null
  const u = unit.toLowerCase().replace(/\.$/, '').trim()
  return UNIT_ALIASES[u] ?? (u || null)
}

const NUMBER_WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, half: 0.5, couple: 2, few: 3, dozen: 12,
}

const FRACTIONS: Record<string, number> = { '½': 0.5, '⅓': 1 / 3, '⅔': 2 / 3, '¼': 0.25, '¾': 0.75, '⅛': 0.125 }

function parseNumberToken(token: string): number | null {
  if (FRACTIONS[token] !== undefined) return FRACTIONS[token]
  if (/^\d+\/\d+$/.test(token)) {
    const [a, b] = token.split('/').map(Number)
    return b ? a / b : null
  }
  if (/^\d+(\.\d+)?$/.test(token)) return Number(token)
  const mixed = token.match(/^(\d+)([½⅓⅔¼¾⅛])$/)
  if (mixed) return Number(mixed[1]) + FRACTIONS[mixed[2]]
  return null
}

export type ParsedItem = { name: string; quantity: number | null; unit: string | null }

/** "2 gallons of milk", "1 1/2 cups flour", "three apples" -> structured item. Keeps the original text when unsure. */
export function parseItemPhrase(input: string): ParsedItem {
  const text = input.replace(/\s+/g, ' ').trim()
  const tokens = text.split(' ')
  let i = 0
  let quantity: number | null = null

  const first = parseNumberToken(tokens[0] ?? '') ?? NUMBER_WORDS[tokens[0]?.toLowerCase() ?? '']
  if (first !== undefined && first !== null && tokens.length > 1) {
    quantity = first
    i = 1
    const second = parseNumberToken(tokens[1] ?? '')
    if (second !== null && second < 1 && tokens.length > 2) {
      quantity += second
      i = 2
    }
  }

  let unit: string | null = null
  const maybeUnit = tokens[i]?.toLowerCase().replace(/[.,]$/, '')
  if (quantity !== null && maybeUnit && UNIT_ALIASES[maybeUnit] && tokens.length > i + 1) {
    unit = UNIT_ALIASES[maybeUnit]
    i += 1
  }
  if (tokens[i]?.toLowerCase() === 'of' && tokens.length > i + 1) i += 1

  const name = tokens.slice(i).join(' ').replace(/^[,\s-]+|[,\s.]+$/g, '') || text
  return { name: name.charAt(0).toUpperCase() + name.slice(1), quantity, unit }
}

/** Split a spoken or typed list into separate items: "milk, eggs and bread" -> 3 items. */
export function splitItemList(input: string): string[] {
  return input
    .replace(/\b(also|plus|then)\b/gi, ',')
    .split(/,|;|\n|\band\b/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 1)
}

export function formatQuantity(quantity: number | string | null | undefined, unit: string | null | undefined): string {
  if (quantity === null || quantity === undefined || quantity === '') return unit ?? ''
  const n = typeof quantity === 'string' ? Number(quantity) : quantity
  const shown = Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100)
  return unit ? `${shown} ${unit}` : shown
}
