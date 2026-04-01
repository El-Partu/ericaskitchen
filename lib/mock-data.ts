import { Category, ProteinOption, ServiceItem, SoupOption } from "@/types";

const mockCategory = (name: string): Category => ({
  _id: name.toLowerCase(),
  name,
  slug: name.toLowerCase(),
  isActive: true,
  sortOrder: 0,
  createdAt: new Date().toISOString(),
});

export const menuItems = [
  {
    id: "1",
    name: "Banku with Okro",
    description:
      "Okro Stew/Soup, Chicken, Goat meat, Salmon, Tilapia, Kotodwe, Liver",
    price: 7.0,
    prepTime: "10 mins",
    image: "/images/banku-okro.jpg",
    isFavorited: true,
    category: mockCategory("Popular"),
    requiresProteinSelection: true,
  },
  {
    id: "2",
    name: "Jollof Rice",
    description: "Salad, Shito, Stew, Grilled Chicken",
    price: 40.0,
    prepTime: "10 mins",
    image: "/images/jollof-rice.jpg",
    isFavorited: true,
    category: mockCategory("Popular"),
  },
  {
    id: "3",
    name: "Waakye",
    description:
      "Salad, Shito, Stew, Grilled Chicken, sausage, ripe plantain, gizzard, egg",
    price: 35.0,
    prepTime: "13 mins",
    image: "/images/waakye.jpg",
    isFavorited: true,
    category: mockCategory("Popular"),
  },
  {
    id: "4",
    name: "Fufu with soup",
    description: "Fufu with chicken and cow meat with light soup",
    price: 20.0,
    prepTime: "13 mins",
    image: "/images/fufu-soup.jpg",
    isFavorited: true,
    category: mockCategory("Locals"),
    requiresProteinSelection: true,
  },
  {
    id: "5",
    name: "Rice Balls",
    description: "Rice balls with Groundnut Soup",
    price: 7.0,
    prepTime: "10 mins",
    image: "/images/rice-balls.jpg",
    isFavorited: false,
    category: mockCategory("Locals"),
    requiresProteinSelection: true,
  },
  {
    id: "6",
    name: "Tuo Zaafi",
    description:
      "Adem3, Soup, Chicken, Goat meat, Salmon, Tilapia, Kotodwe, Liver",
    price: 7.0,
    prepTime: "20 mins",
    image: "/images/tuo-zaafi.jpg",
    isFavorited: false,
    category: mockCategory("Locals"),
    requiresProteinSelection: true,
  },
  {
    id: "7",
    name: "Banku with Tilapia",
    description: "2 balls of banku with grilled chicken",
    price: 7.0,
    prepTime: "13 mins",
    image: "/images/banku-tilapia.jpg",
    isFavorited: true,
    category: mockCategory("Locals"),
  },
  {
    id: "8",
    name: "Fried Rice",
    description: "Salad, Shito, Grilled Chicken, sausage",
    price: 40.0,
    prepTime: "20 mins",
    image: "/images/fried-rice.jpg",
    isFavorited: false,
    category: mockCategory("Continental"),
  },
  {
    id: "9",
    name: "Plain Rice",
    description:
      "Salad, Shito, Stew, Grilled Chicken, sausage, ripe plantain, gizzard, egg",
    price: 7.0,
    prepTime: "10 mins",
    image: "/images/plain-rice.jpg",
    isFavorited: false,
    category: mockCategory("Continental"),
    requiresProteinSelection: true,
  },

  /* ── Drinks ────────────────────────────────────────── */
  {
    id: "10",
    name: "Bottled Water (medium)",
    price: 4.0,
    image: "/images/bottled-water-medium.jpg",
    isFavorited: true,
    category: mockCategory("Drinks"),
    isDrink: true,
  },
  {
    id: "11",
    name: "Coca Cola (medium)",
    price: 12.0,
    image: "/images/coca-cola-medium.jpg",
    isFavorited: true,
    category: mockCategory("Drinks"),
    isDrink: true,
  },
  {
    id: "12",
    name: "Sprite",
    price: 7.0,
    image: "/images/sprite.jpg",
    isFavorited: true,
    category: mockCategory("Drinks"),
    isDrink: true,
  },
  {
    id: "13",
    name: "Pineapple Juice",
    price: 18.0,
    image: "/images/pineapple-juice.jpg",
    isFavorited: true,
    category: mockCategory("Drinks"),
    isDrink: true,
  },
  {
    id: "14",
    name: "Can Malt",
    price: 15.0,
    image: "/images/can-malt.jpg",
    isFavorited: true,
    category: mockCategory("Drinks"),
    isDrink: true,
  },
  {
    id: "15",
    name: "Sobolo Juice",
    price: 20.0,
    image: "/images/sobolo-juice.jpg",
    isFavorited: true,
    category: mockCategory("Drinks"),
    isDrink: true,
  },
  {
    id: "16",
    name: "Welch's",
    price: 45.0,
    image: "/images/welchs.jpg",
    isFavorited: true,
    category: mockCategory("Drinks"),
    isDrink: true,
  },
];

export const heroSlides = [
  {
    title: "Food of the\nDay - Banku with Soup",
    image: "/images/hero-banku.jpg",
    ctaLabel: "Place Order",
    ctaHref: "/menu",
  },
  {
    title: "Food of the\nDay - Jollof Rice",
    image: "/images/hero-jollof.jpg",
    ctaLabel: "View Menu",
    ctaHref: "/menu",
  },
];

export const featuredItems = menuItems.slice(0, 2);

export const testimonials = [
  {
    id: "1",
    name: "Ama K.",
    role: "Student Food\nBlogger",
    avatar: "/images/testimonial-ama.jpg",
    quote:
      "As someone who is very picky about my Okro soup, I was blown away. The Banku has that perfect fermented tang, and the soup is rich and loaded—just like home. It's rare to find a place that balances traditional taste with such a modern atmosphere",
  },
  {
    id: "2",
    name: "David O.",
    role: "Tech Consultant",
    avatar: "/images/testimonial-david.jpg",
    quote:
      "Finally, a spot that gets Jollof right! The smoky flavor is incredible, and the grilled chicken was juicy and well-seasoned. It's become my go-to for a quick lunch that doesn't compromise on quality. The online ordering was seamless, too.",
  },
  {
    id: "3",
    name: "Sarah M.",
    role: "Interior Designer",
    avatar: "/images/testimonial-sarah.jpg",
    quote:
      "The perfect vibe for a weekend hangout. We sat in the garden area and the service was top-notch. You can tell they care about the details, from the plating of the salad to the playlist. Truly a hidden gem in the city of Legon!",
  },
];

export const dailySpecials = [
  {
    title: "The Coastal Classic Banku & Okro Soup",
    description:
      "Authentic, fermented corn and cassava dough served with a rich, hearty okro soup, loaded with tender meat and fresh seafood.",
  },
  {
    title: "The Urban Favorite Jollof Rice & Grilled Chicken",
    description:
      "Our signature smoky Jollof rice paired with spice-rubbed grilled chicken and a crisp, refreshing garden salad.",
  },
];

export const services: ServiceItem[] = [
  {
    id: "1",
    title: "Dine-In Experience",
    description:
      'The core service—offering a curated atmosphere, table service, and the full "vibe" of the restaurant for individuals, couples, and groups.',
    icon: "utensils",
  },
  {
    id: "2",
    title: "Corporate & Private Catering",
    description:
      'Professional food services for office meetings, weddings, or private parties. You can include a "Request Quote" button specifically for this.',
    icon: "briefcase",
  },
  {
    id: "3",
    title: "Meal Prep & Bulk Orders",
    description:
      'For busy professionals who want to stock up for the week. This could include chilled, "heat-and-eat" versions of your signature dishes.',
    icon: "package",
  },
  {
    id: "4",
    title: "Curated Gift Cards",
    description:
      "Digital or physical vouchers that customers can buy for friends and family—a great way to boost revenue and brand loyalty.",
    icon: "gift",
  },
  {
    id: "5",
    title: "Chef's Table / Tasting Sessions",
    description:
      'A premium, "behind-the-scenes" experience where the Chef prepares a multi-course meal (like a fusion of Ghanaian and Continental styles) with a story behind every plate.',
    icon: "chef-hat",
  },
];

/* ── Soup & Protein Options ──────────────────────────── */

export const soupOptions: SoupOption[] = [
  { id: "soup-1", name: "Okro Stew", price: 7.0, note: "Upwards" },
  { id: "soup-2", name: "Palmnut Soup", price: 0 },
  { id: "soup-3", name: "Groundnut Soup", price: 0 },
  { id: "soup-4", name: "Chicken Light Soup", price: 0 },
  { id: "soup-5", name: "Goat Light Soup", price: 0 },
  {
    id: "soup-6",
    name: "Abunuabunu (or Ebunuebunu)",
    price: 0,
    note: "TUESDAYS ONLY",
  },
];

export const proteinOptions: ProteinOption[] = [
  { id: "protein-1", name: "Goat", price: 35.0 },
  { id: "protein-2", name: "Cow", price: 30.0 },
  { id: "protein-3", name: "Chicken", price: 25.0 },
  { id: "protein-4", name: "Goat Intestine", price: 25.0 },
  { id: "protein-5", name: "Towel", price: 15.0 },
  { id: "protein-6", name: "Liver", price: 15.0 },
  { id: "protein-7", name: "Tuna", price: 15.0 },
  { id: "protein-8", name: "Salmon", price: 25.0 },
  { id: "protein-9", name: "Beef", price: 15.0 },
  { id: "protein-10", name: "Tilapia", price: 30.0 },
  { id: "protein-11", name: "Wele", price: 5.0 },
];
