export type Product = {
  id: string;
  name: string;
  category: "Decor" | "Jewelry" | "Lighting" | "Textiles";
  price: number;
  originalPrice?: number;
  condition: "Like new" | "Excellent" | "Very good" | "Good";
  rating: number;
  description: string;
  image: string;
  featured: boolean;
  stock: number;
  visual: string;
  glyph: string;
};

export type CartItem = { productId: string; quantity: number };

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  customerName: string;
  email: string;
  address: string;
  status: "confirmed";
  createdAt: string;
};

export const PRODUCTS: Product[] = [
  { id: "brass-table-lamp", name: "Brass Table Lamp", category: "Lighting", price: 58, originalPrice: 89, condition: "Very good", rating: 4.8, description: "A tarnished brass lamp with a fluted stem and a warm linen shade. The kind of patina you cannot buy new, only inherit.", image: "https://images.unsplash.com/photo-1608904691208-4805905b5e62", featured: true, stock: 4, visual: "visual-brass", glyph: "L" },
  { id: "amber-glass-vase", name: "Amber Glass Vase", category: "Decor", price: 32, originalPrice: 45, condition: "Excellent", rating: 4.7, description: "Hand-blown amber glass with tiny bubbles trapped in the walls. Holds dried stems beautifully, or nothing at all.", image: "https://images.unsplash.com/photo-1767551715049-fcd9b818b2d4", featured: false, stock: 9, visual: "visual-amber", glyph: "V" },
  { id: "cameo-brooch", name: "Vintage Cameo Brooch", category: "Jewelry", price: 45, originalPrice: 70, condition: "Excellent", rating: 4.9, description: "A carved shell cameo in a rolled-gold frame, likely 1960s. The clasp still catches cleanly after all these years.", image: "https://images.unsplash.com/photo-1719862056472-1e4d4c10d50c", featured: true, stock: 3, visual: "visual-garnet", glyph: "B" },
  { id: "rattan-basket", name: "Woven Rattan Basket", category: "Decor", price: 24, condition: "Good", rating: 4.6, description: "A sturdy hand-woven basket that has clearly held someone else's magazines, yarn, or secrets. Ready for yours.", image: "https://images.unsplash.com/photo-1455669175216-9017c9b02fc6", featured: true, stock: 11, visual: "visual-moss", glyph: "R" },
  { id: "pearl-drop-earrings", name: "Pearl Drop Earrings", category: "Jewelry", price: 38, originalPrice: 55, condition: "Like new", rating: 4.8, description: "Freshwater pearls on delicate gold-tone hooks, gently reworked from a single mismatched pair we could not let go.", image: "https://images.unsplash.com/photo-1682822749969-61a63203c501", featured: false, stock: 6, visual: "visual-cream", glyph: "P" },
  { id: "loomed-throw-pillow", name: "Hand-loomed Throw Pillow", category: "Textiles", price: 29, condition: "Very good", rating: 4.7, description: "A thick woven cover in a faded indigo stripe, the kind of fabric that only gets softer with a few more years on the sofa.", image: "https://images.unsplash.com/photo-1629949008265-af1bcaf59786", featured: false, stock: 8, visual: "visual-denim", glyph: "T" },
  { id: "carved-trinket-box", name: "Carved Trinket Box", category: "Decor", price: 36, originalPrice: 52, condition: "Excellent", rating: 4.9, description: "Solid walnut with a hand-carved lid and a small brass hinge that still sits flush. Just the right size for rings and receipts.", image: "https://images.unsplash.com/photo-1691095744255-0fc8e93c4639", featured: false, stock: 5, visual: "visual-walnut", glyph: "C" },
  { id: "filigree-ring", name: "Sterling Filigree Ring", category: "Jewelry", price: 52, originalPrice: 78, condition: "Like new", rating: 4.8, description: "An openwork sterling band with an antique finish, sized and re-polished by hand. No two filigree patterns turn out the same.", image: "https://images.unsplash.com/photo-1656010280156-fa8c1793c235", featured: true, stock: 4, visual: "visual-brass", glyph: "F" },
];

export const CATEGORIES = ["All", "Decor", "Jewelry", "Lighting", "Textiles"] as const;

export const CATEGORY_INFO: Record<Exclude<(typeof CATEGORIES)[number], "All">, { image: string; count: string }> = {
  Decor: { image: "https://images.unsplash.com/photo-1455669175216-9017c9b02fc6", count: "Objects & vases" },
  Jewelry: { image: "https://images.unsplash.com/photo-1719862056472-1e4d4c10d50c", count: "Rings & brooches" },
  Lighting: { image: "https://images.unsplash.com/photo-1608904691208-4805905b5e62", count: "Lamps & sconces" },
  Textiles: { image: "https://images.unsplash.com/photo-1629949008265-af1bcaf59786", count: "Pillows & throws" },
};

export const money = (value: number) => `$${value.toFixed(2)}`;
