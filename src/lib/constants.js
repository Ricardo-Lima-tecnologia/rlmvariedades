export const STORE_NAME = "RLM Variedades";
export const WHATSAPP_NUMBER = "5511999999999";
export const WHATSAPP_MESSAGE = "Olá! Gostaria de saber mais sobre os produtos da RLM Variedades.";

export const CATEGORIES = [
  { slug: "casa-inteligente", name: "Casa Inteligente", icon: "Home" },
  { slug: "automotivo", name: "Automotivo", icon: "Car" },
  { slug: "saude-beleza", name: "Saúde & Beleza", icon: "Heart" },
  { slug: "ferramentas", name: "Ferramentas", icon: "Wrench" },
  { slug: "eletronicos", name: "Eletrônicos", icon: "Smartphone" },
  { slug: "fitness", name: "Fitness", icon: "Dumbbell" },
  { slug: "cozinha", name: "Cozinha", icon: "ChefHat" },
  { slug: "pets", name: "Pets", icon: "PawPrint" },
];

export const BADGE_LABELS = {
  "mais-vendido": "Mais Vendido",
  "oferta": "Oferta",
  "exclusivo": "Exclusivo",
  "novo": "Novidade",
  "frete-gratis": "Frete Grátis",
  "": "",
};

export const BADGE_COLORS = {
  "mais-vendido": "bg-primary text-primary-foreground",
  "oferta": "bg-destructive text-destructive-foreground",
  "exclusivo": "bg-accent text-accent-foreground",
  "novo": "bg-success text-success-foreground",
  "frete-gratis": "bg-success text-success-foreground",
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
};

export const calcDiscount = (price, comparePrice) => {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
};