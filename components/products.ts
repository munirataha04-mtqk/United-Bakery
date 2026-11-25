// EDIT YOUR PRODUCTS HERE.
// Each product has: picture (one of the drawings below), name, description and price.
// These are sample products and prices for the preview.

export type Product = { picture: keyof typeof drawings; name: string; description: string; price: string };

export const products: Product[] = [
  { picture: "croissant", name: "Butter croissant", description: "Layered dough, laminated with butter, baked crisp.", price: "$3.50" },
  { picture: "sourdough", name: "Country sourdough", description: "Long slow rise, dark crust, open crumb.", price: "$8.00" },
  { picture: "cookie", name: "Chocolate chunk cookie", description: "Brown butter dough with dark chocolate.", price: "$2.75" },
  { picture: "roll", name: "Cinnamon roll", description: "Soft spiral with cinnamon sugar and icing.", price: "$4.25" },
  { picture: "baguette", name: "Classic baguette", description: "Crackly crust, baked several times a day.", price: "$3.00" },
  { picture: "slice", name: "Strawberry cream slice", description: "Sponge, fresh cream and strawberries.", price: "$5.50" },
];

// Simple drawings of each product (SVG shapes, 200 x 140).
export const drawings = {
  croissant: `<ellipse cx="100" cy="118" rx="70" ry="7" fill="#000" opacity=".08"/><ellipse cx="44" cy="96" rx="20" ry="12" transform="rotate(-30 44 96)" fill="var(--crust)"/><ellipse cx="156" cy="96" rx="20" ry="12" transform="rotate(30 156 96)" fill="var(--crust)"/><ellipse cx="68" cy="82" rx="28" ry="22" transform="rotate(-20 68 82)" fill="var(--gold)"/><ellipse cx="132" cy="82" rx="28" ry="22" transform="rotate(20 132 82)" fill="var(--gold)"/><ellipse cx="100" cy="76" rx="34" ry="30" fill="#e2b06a"/><path d="M84 52q-6 24 0 50M100 47v58M116 52q6 24 0 50M58 66q-4 18 4 36M142 66q4 18-4 36" stroke="var(--dark)" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/><ellipse cx="92" cy="62" rx="12" ry="6" fill="#fff" opacity=".25"/>`,
  sourdough: `<ellipse cx="100" cy="120" rx="76" ry="8" fill="#000" opacity=".08"/><ellipse cx="100" cy="80" rx="76" ry="42" fill="var(--crust)"/><ellipse cx="100" cy="72" rx="66" ry="30" fill="var(--dark)" opacity=".35"/><path d="M48 76q52-40 104 0" stroke="#f0d6a8" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M60 92q40-22 80 0" stroke="#f0d6a8" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/><g fill="#fff" opacity=".55"><circle cx="70" cy="58" r="2"/><circle cx="120" cy="54" r="1.6"/><circle cx="140" cy="66" r="2"/><circle cx="90" cy="50" r="1.4"/><circle cx="104" cy="62" r="1.2"/></g>`,
  cookie: `<ellipse cx="100" cy="122" rx="58" ry="7" fill="#000" opacity=".08"/><circle cx="100" cy="72" r="52" fill="var(--gold)"/><circle cx="100" cy="72" r="52" fill="none" stroke="var(--crust)" stroke-width="6" opacity=".6"/><g fill="var(--choc)"><path d="M76 50l12-3 4 10-11 5z"/><path d="M114 44l13 4-3 11-12-2z"/><path d="M92 78l13-2 2 12-13 2z"/><path d="M66 84l10 3-3 10-10-4z"/><path d="M124 80l11 5-5 10-10-5z"/><path d="M102 102l10 1-1 9-11-1z"/></g>`,
  roll: `<ellipse cx="100" cy="122" rx="58" ry="7" fill="#000" opacity=".08"/><circle cx="100" cy="72" r="52" fill="var(--crust)"/><path d="M100 72m0-4a4 4 0 1 1-4 6a10 10 0 1 1 18-6a18 18 0 1 1-30 14a28 28 0 1 1 50-20a38 38 0 1 1-62 30" fill="none" stroke="#f0d6a8" stroke-width="5" stroke-linecap="round"/><path d="M58 52q14 10 26-2t24 4 24-6 18 10M60 92q14-8 28 2t26-4 26 6" stroke="var(--icing)" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  baguette: `<ellipse cx="100" cy="122" rx="86" ry="7" fill="#000" opacity=".08"/><rect x="14" y="58" width="172" height="40" rx="20" transform="rotate(-12 100 78)" fill="var(--crust)"/><g transform="rotate(-12 100 78)" stroke="#f0d6a8" stroke-width="6" stroke-linecap="round"><path d="M40 72l22-6M76 72l22-6M112 72l22-6M148 72l18-5"/></g>`,
  slice: `<ellipse cx="100" cy="124" rx="70" ry="7" fill="#000" opacity=".08"/><path d="M36 112l26-70 104 22v48z" fill="#f4dfb8"/><path d="M42 96l112 0v6h-118zM50 74h116v8H46z" fill="var(--icing)"/><path d="M62 42l104 22-6 4-102-20z" fill="var(--icing)"/><path d="M166 64v48h-10V66z" fill="#e8cf9e"/><circle cx="118" cy="44" r="13" fill="var(--berry)"/><path d="M112 33l6-6 6 6" stroke="#3f7d3a" stroke-width="4" fill="none" stroke-linecap="round"/>`,
};
