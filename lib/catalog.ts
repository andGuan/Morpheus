export type SelectionKind = "plate" | "cutlery" | "glass";

export type CatalogItem = {
  id: string;
  name: string;
  detail: string;
  image?: string;
  previewImage?: string;
  art?: string;
};

export const catalog: Record<SelectionKind, CatalogItem[]> = {
  plate: [
    { id: "dish_001", name: "Versailles Relief", detail: "Bernardaud · gilded bone china", image: "/tableware/dish_001.webp", previewImage: "/tableware/cutout/dish_001.webp" },
    { id: "dish_002", name: "Candlewick Bead", detail: "Imperial Glass · clear glass", image: "/tableware/dish_002.webp", previewImage: "/tableware/cutout/dish_002.webp" },
    { id: "set_001", name: "King's Garden", detail: "Haviland · bird & crest", image: "/tableware/set_001.webp", previewImage: "/tableware/cutout/set_001.webp" },
  ],
  cutlery: [
    { id: "classic", name: "Classic Silver", detail: "Polished sterling", image: "/tableware/cutout/cutlery_classic.webp", previewImage: "/tableware/cutout/cutlery_classic.webp", art: "classic" },
    { id: "modern", name: "Modern Silver", detail: "Contemporary profile", image: "/tableware/cutout/cutlery_modern.webp", previewImage: "/tableware/cutout/cutlery_modern.webp", art: "modern" },
    { id: "ornate", name: "Ornate Silver", detail: "Engraved handles", image: "/tableware/cutout/cutlery_ornate.webp", previewImage: "/tableware/cutout/cutlery_ornate.webp", art: "ornate" },
    { id: "heirloom", name: "Heirloom Gold", detail: "Warm gold finish", image: "/tableware/cutout/cutlery_heirloom.webp", previewImage: "/tableware/cutout/cutlery_heirloom.webp", art: "heirloom" },
    { id: "louche", name: "Louche", detail: "Refined proportions", image: "/tableware/cutout/cutlery_louche.webp", previewImage: "/tableware/cutout/cutlery_louche.webp", art: "louche" },
  ],
  glass: [
    { id: "cup_001", name: "Lulli Etched", detail: "Baccarat · short-stem crystal", image: "/tableware/cup_001.webp", previewImage: "/tableware/cutout/cup_001.webp" },
    { id: "cup_002", name: "Stella Gold Rim", detail: "Saint-Louis · cut crystal", image: "/tableware/cup_002.webp", previewImage: "/tableware/cutout/cup_002.webp" },
    { id: "cup_003", name: "Laurel Bow", detail: "Bohemia · gilded crystal", image: "/tableware/cup_003.webp", previewImage: "/tableware/cutout/cup_003.webp" },
    { id: "cup_004", name: "Tinted Collection", detail: "Saint-Louis · colored crystal", image: "/tableware/cup_004.webp", previewImage: "/tableware/cutout/cup_004.webp" },
    { id: "cup_005", name: "Lulli Straight", detail: "Baccarat · etched tumbler", image: "/tableware/cup_005.webp", previewImage: "/tableware/cutout/cup_005.webp" },
  ],
};