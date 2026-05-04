import type { RawRestaurantInput } from "../../shared/types";
import { MICHELIN_RESTAURANTS } from "./generatedMichelinData";

export const MOCK_RESTAURANTS: RawRestaurantInput[] = [
  {
    source: "mock",
    sourceId: "le-jardin-paris",
    name: "Le Jardin Lumiere",
    awardType: "3-star",
    cuisine: "French",
    description: "A precise Paris dining room focused on seafood and classic sauces.",
    address: "12 Rue Imaginaire",
    city: "Paris",
    country: "France",
    latitude: 48.8566,
    longitude: 2.3522,
    websiteUrl: "https://example.com/le-jardin-lumiere",
    sourceUrl: "https://example.com/michelinmapper-seed.json",
    dishes: [
      {
        sourceId: "le-jardin-turbot-caviar",
        name: "Turbot with caviar beurre blanc",
        description: "Line-caught turbot finished with oyster, caviar, and beurre blanc.",
        imageUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Plated fish dish with sauce",
        imageCredit: "Unsplash",
        sourceUrl: "https://example.com/le-jardin-lumiere/turbot",
        priceText: "Tasting menu"
      },
      {
        sourceId: "le-jardin-chocolate-souffle",
        name: "Dark chocolate souffle",
        description: "Warm chocolate souffle with vanilla ice cream.",
        imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Chocolate dessert",
        imageCredit: "Unsplash",
        sourceUrl: "https://example.com/le-jardin-lumiere/souffle"
      }
    ]
  },
  {
    source: "mock",
    sourceId: "kumo-tokyo",
    name: "Kumo",
    awardType: "1-star",
    cuisine: "Japanese",
    description: "Counter dining in Tokyo with seasonal fish and dashi-led broths.",
    city: "Tokyo",
    country: "Japan",
    latitude: 35.6762,
    longitude: 139.6503,
    websiteUrl: "https://example.com/kumo",
    sourceUrl: "https://example.com/michelinmapper-seed.json",
    dishes: [
      {
        sourceId: "kumo-yuzu-miso-cod",
        name: "Yuzu miso cod",
        description: "Miso-marinated cod with yuzu and dashi.",
        imageUrl: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Japanese fish course",
        imageCredit: "Unsplash",
        sourceUrl: "https://example.com/kumo/yuzu-miso-cod"
      }
    ]
  },
  {
    source: "mock",
    sourceId: "mesa-clara-lisbon",
    name: "Mesa Clara",
    awardType: "bib-gourmand",
    cuisine: "Portuguese",
    description: "Relaxed Lisbon cooking with generous seafood plates.",
    city: "Lisbon",
    country: "Portugal",
    latitude: 38.7223,
    longitude: -9.1393,
    websiteUrl: "https://example.com/mesa-clara",
    sourceUrl: "https://example.com/michelinmapper-seed.json",
    dishes: [
      {
        sourceId: "mesa-clara-crab-rice",
        name: "Atlantic crab rice",
        description: "Clay-pot rice with crab, herbs, and shellfish stock.",
        imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Seafood rice dish",
        imageCredit: "Unsplash",
        sourceUrl: "https://example.com/mesa-clara/crab-rice"
      }
    ]
  },
  {
    source: "curated",
    sourceId: "the-french-laundry-yountville",
    name: "The French Laundry",
    awardType: "3-star",
    cuisine: "Contemporary American",
    description: "Yountville fine dining known for precise tasting menus and produce-led luxury.",
    city: "Yountville",
    region: "California",
    country: "United States",
    latitude: 38.4044,
    longitude: -122.365,
    websiteUrl: "https://www.thomaskeller.com/tfl",
    sourceUrl: "https://www.thomaskeller.com/tfl",
    dishes: [
      {
        sourceId: "tfl-oysters-and-pearls",
        name: "Oysters and Pearls",
        description: "Sabayon of pearl tapioca with Island Creek oysters and white sturgeon caviar.",
        imageUrl: "https://images.unsplash.com/photo-1606850780554-b55ea4dd0b70?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Oyster and caviar seafood course",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.thomaskeller.com/tfl"
      },
      {
        sourceId: "tfl-salmon-cornet",
        name: "Salmon cornet",
        description: "A crisp savory cone with salmon tartare and creme fraiche.",
        imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Fine dining salmon bite",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.thomaskeller.com/tfl"
      },
      {
        sourceId: "tfl-garden-vegetables",
        name: "Garden vegetables with truffle",
        description: "Seasonal vegetables finished with black truffle and classic French technique.",
        imageUrl: "https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Fine dining vegetable course",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.thomaskeller.com/tfl"
      }
    ]
  },
  {
    source: "curated",
    sourceId: "the-fat-duck-bray",
    name: "The Fat Duck",
    awardType: "3-star",
    cuisine: "Creative British",
    description: "Experimental Bray restaurant known for multisensory tasting-menu storytelling.",
    city: "Bray",
    country: "United Kingdom",
    latitude: 51.5079,
    longitude: -0.7018,
    websiteUrl: "https://thefatduck.co.uk/",
    sourceUrl: "https://thefatduck.co.uk/",
    dishes: [
      {
        sourceId: "fat-duck-sound-of-the-sea",
        name: "Sound of the Sea",
        description: "Seafood, seaweed, and edible sand served with a coastal soundscape.",
        imageUrl: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Seafood tasting course",
        imageCredit: "Unsplash",
        sourceUrl: "https://thefatduck.co.uk/"
      },
      {
        sourceId: "fat-duck-snail-porridge",
        name: "Snail porridge",
        description: "A savory porridge with snails, garlic, herbs, and restaurant theatre.",
        imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Savory green fine dining course",
        imageCredit: "Unsplash",
        sourceUrl: "https://thefatduck.co.uk/"
      },
      {
        sourceId: "fat-duck-nitro-aperitif",
        name: "Nitro-poached aperitif",
        description: "A frozen tableside palate-opener with citrus and aromatic herbs.",
        imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Frozen dessert-style course",
        imageCredit: "Unsplash",
        sourceUrl: "https://thefatduck.co.uk/"
      }
    ]
  },
  {
    source: "curated",
    sourceId: "le-bernardin-new-york",
    name: "Le Bernardin",
    awardType: "3-star",
    cuisine: "French Seafood",
    description: "New York seafood institution focused on pristine fish and restrained French technique.",
    city: "New York",
    region: "New York",
    country: "United States",
    latitude: 40.7615,
    longitude: -73.9818,
    websiteUrl: "https://www.le-bernardin.com/",
    sourceUrl: "https://www.le-bernardin.com/",
    dishes: [
      {
        sourceId: "le-bernardin-tuna-foie-gras",
        name: "Tuna with foie gras",
        description: "Thinly pounded yellowfin tuna layered with foie gras and toasted baguette.",
        imageUrl: "https://images.unsplash.com/photo-1546039907-7fa05f864c02?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Fine dining tuna course",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.le-bernardin.com/"
      },
      {
        sourceId: "le-bernardin-scallop",
        name: "Barely cooked scallop",
        description: "Scallop with brown butter dashi, citrus, and delicate shellfish flavors.",
        imageUrl: "https://images.unsplash.com/photo-1560717845-968823efbee1?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Scallop seafood dish",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.le-bernardin.com/"
      },
      {
        sourceId: "le-bernardin-dover-sole",
        name: "Dover sole with shellfish sauce",
        description: "Dover sole finished with shellfish, herbs, and classic sauce work.",
        imageUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Plated fish with sauce",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.le-bernardin.com/"
      }
    ]
  },
  {
    source: "curated",
    sourceId: "disfrutar-barcelona",
    name: "Disfrutar",
    awardType: "3-star",
    cuisine: "Creative Spanish",
    description: "Barcelona avant-garde restaurant using playful technique and Mediterranean flavor.",
    city: "Barcelona",
    country: "Spain",
    latitude: 41.3881,
    longitude: 2.1539,
    websiteUrl: "https://www.disfrutarbarcelona.com/",
    sourceUrl: "https://www.disfrutarbarcelona.com/",
    dishes: [
      {
        sourceId: "disfrutar-panchino-caviar",
        name: "Panchino with caviar",
        description: "Airy fried bread with sour cream and caviar.",
        imageUrl: "https://images.unsplash.com/photo-1601314002592-b8734bca6604?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Fine dining caviar bite",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.disfrutarbarcelona.com/"
      },
      {
        sourceId: "disfrutar-multispherical-pesto",
        name: "Multi-spherical pesto",
        description: "A technical pesto preparation using modernist spherification.",
        imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Green Mediterranean pasta-inspired dish",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.disfrutarbarcelona.com/"
      },
      {
        sourceId: "disfrutar-crispy-egg-yolk",
        name: "Crispy egg yolk",
        description: "A precise egg course built around texture contrast and umami.",
        imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Egg dish",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.disfrutarbarcelona.com/"
      }
    ]
  },
  {
    source: "curated",
    sourceId: "singlethread-healdsburg",
    name: "SingleThread",
    awardType: "3-star",
    cuisine: "Californian Japanese",
    description: "Farm, inn, and restaurant in Sonoma County with Japanese-influenced tasting menus.",
    city: "Healdsburg",
    region: "California",
    country: "United States",
    latitude: 38.6105,
    longitude: -122.8692,
    websiteUrl: "https://www.singlethreadfarms.com/",
    sourceUrl: "https://www.singlethreadfarms.com/",
    dishes: [
      {
        sourceId: "singlethread-sonoma-vegetables",
        name: "Sonoma vegetable hassun",
        description: "A composed opening course of seasonal farm vegetables and seafood bites.",
        imageUrl: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Seasonal vegetable course",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.singlethreadfarms.com/"
      },
      {
        sourceId: "singlethread-black-cod",
        name: "Black cod with miso",
        description: "Miso-glazed black cod with dashi-led accompaniments.",
        imageUrl: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Japanese fish course",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.singlethreadfarms.com/"
      },
      {
        sourceId: "singlethread-wagyu",
        name: "Wagyu with farm greens",
        description: "Japanese wagyu paired with herbs and vegetables from the farm.",
        imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Wagyu beef dish",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.singlethreadfarms.com/"
      }
    ]
  },
  {
    source: "curated",
    sourceId: "atomix-new-york",
    name: "Atomix",
    awardType: "2-star",
    cuisine: "Korean",
    description: "New York tasting counter translating Korean ingredients into refined modern courses.",
    city: "New York",
    region: "New York",
    country: "United States",
    latitude: 40.7445,
    longitude: -73.9821,
    websiteUrl: "https://www.atomixnyc.com/",
    sourceUrl: "https://www.atomixnyc.com/",
    dishes: [
      {
        sourceId: "atomix-seasonal-banchan",
        name: "Seasonal banchan",
        description: "A refined Korean opening sequence of fermented, pickled, and seasonal bites.",
        imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Korean small plates",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.atomixnyc.com/"
      },
      {
        sourceId: "atomix-jook",
        name: "Jook with shellfish",
        description: "Korean rice porridge with shellfish stock and layered umami.",
        imageUrl: "https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Rice porridge course",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.atomixnyc.com/"
      },
      {
        sourceId: "atomix-wagyu-galbi",
        name: "Wagyu galbi",
        description: "Short rib-inspired wagyu course with Korean barbecue notes.",
        imageUrl: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Grilled beef course",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.atomixnyc.com/"
      }
    ]
  },
  {
    source: "curated",
    sourceId: "tim-ho-wan-hong-kong",
    name: "Tim Ho Wan",
    awardType: "bib-gourmand",
    cuisine: "Cantonese",
    description: "Hong Kong dim sum specialist known for affordable, high-quality small plates.",
    city: "Hong Kong",
    country: "Hong Kong",
    latitude: 22.3193,
    longitude: 114.1694,
    websiteUrl: "https://timhowan.com/",
    sourceUrl: "https://timhowan.com/",
    dishes: [
      {
        sourceId: "tim-ho-wan-bbq-pork-buns",
        name: "Baked barbecue pork buns",
        description: "Crisp-topped buns filled with sweet-savory char siu pork.",
        imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Dim sum buns",
        imageCredit: "Unsplash",
        sourceUrl: "https://timhowan.com/"
      },
      {
        sourceId: "tim-ho-wan-rice-roll",
        name: "Steamed rice roll with shrimp",
        description: "Silky cheung fun wrapped around shrimp with soy-based sauce.",
        imageUrl: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Steamed dumpling dish",
        imageCredit: "Unsplash",
        sourceUrl: "https://timhowan.com/"
      },
      {
        sourceId: "tim-ho-wan-turnip-cake",
        name: "Pan-fried turnip cake",
        description: "Radish cake with crisp edges, soft center, and savory Cantonese seasoning.",
        imageUrl: "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Pan-fried dim sum",
        imageCredit: "Unsplash",
        sourceUrl: "https://timhowan.com/"
      }
    ]
  },
  {
    source: "curated",
    sourceId: "alinea-chicago",
    name: "Alinea",
    awardType: "3-star",
    cuisine: "Progressive American",
    description: "Chicago restaurant known for theatrical, technically ambitious tasting menus.",
    city: "Chicago",
    region: "Illinois",
    country: "United States",
    latitude: 41.9134,
    longitude: -87.6483,
    websiteUrl: "https://www.alinearestaurant.com/",
    sourceUrl: "https://www.alinearestaurant.com/",
    dishes: [
      {
        sourceId: "alinea-black-truffle-explosion",
        name: "Black truffle explosion",
        description: "A delicate raviolo filled with warm black truffle broth.",
        imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Fine dining pasta course",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.alinearestaurant.com/"
      },
      {
        sourceId: "alinea-hot-potato-cold-potato",
        name: "Hot potato, cold potato",
        description: "A playful temperature-contrast bite with potato, truffle, and butter.",
        imageUrl: "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Potato and truffle course",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.alinearestaurant.com/"
      },
      {
        sourceId: "alinea-edible-balloon",
        name: "Edible balloon",
        description: "A floating sugar balloon scented with green apple.",
        imageUrl: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Playful dessert course",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.alinearestaurant.com/"
      }
    ]
  },
  {
    source: "curated",
    sourceId: "atelier-crenn-san-francisco",
    name: "Atelier Crenn",
    awardType: "3-star",
    cuisine: "Poetic French",
    description: "San Francisco tasting-menu restaurant with poetic, seafood-forward plates.",
    city: "San Francisco",
    region: "California",
    country: "United States",
    latitude: 37.7984,
    longitude: -122.4359,
    websiteUrl: "https://www.ateliercrenn.com/",
    sourceUrl: "https://www.ateliercrenn.com/",
    dishes: [
      {
        sourceId: "atelier-crenn-kir-breton",
        name: "Kir Breton",
        description: "A refined opening bite inspired by Brittany and cider.",
        imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Elegant amuse bouche",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.ateliercrenn.com/"
      },
      {
        sourceId: "atelier-crenn-oyster-rose",
        name: "Oyster with rose",
        description: "Oyster course with floral acidity and coastal salinity.",
        imageUrl: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Oyster dish",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.ateliercrenn.com/"
      },
      {
        sourceId: "atelier-crenn-abalone",
        name: "Abalone with seaweed",
        description: "A shellfish course with seaweed, beurre blanc, and ocean herbs.",
        imageUrl: "https://images.unsplash.com/photo-1562967915-92ae0c320a01?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Shellfish course",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.ateliercrenn.com/"
      }
    ]
  },
  {
    source: "curated",
    sourceId: "benu-san-francisco",
    name: "Benu",
    awardType: "3-star",
    cuisine: "Korean American",
    description: "San Francisco restaurant blending Korean, Cantonese, and contemporary American technique.",
    city: "San Francisco",
    region: "California",
    country: "United States",
    latitude: 37.7854,
    longitude: -122.3992,
    websiteUrl: "https://www.benusf.com/",
    sourceUrl: "https://www.benusf.com/",
    dishes: [
      {
        sourceId: "benu-thousand-year-quail-egg",
        name: "Thousand-year-old quail egg",
        description: "A refined preserved-egg bite with ginger and fermented notes.",
        imageUrl: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Quail egg dish",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.benusf.com/"
      },
      {
        sourceId: "benu-lobster-coral-xiao-long-bao",
        name: "Lobster coral xiao long bao",
        description: "Soup dumpling with lobster coral and shellfish depth.",
        imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Dumplings",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.benusf.com/"
      },
      {
        sourceId: "benu-oyster-kimchi-pork",
        name: "Oyster with kimchi and pork belly",
        description: "A Korean-influenced oyster course with pork, spice, and fermentation.",
        imageUrl: "https://images.unsplash.com/photo-1606850780554-b55ea4dd0b70?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Oyster course",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.benusf.com/"
      }
    ]
  },
  {
    source: "curated",
    sourceId: "el-celler-de-can-roca-girona",
    name: "El Celler de Can Roca",
    awardType: "3-star",
    cuisine: "Creative Catalan",
    description: "Girona restaurant known for contemporary Catalan cooking and technical precision.",
    city: "Girona",
    country: "Spain",
    latitude: 41.993,
    longitude: 2.807,
    websiteUrl: "https://cellercanroca.com/",
    sourceUrl: "https://cellercanroca.com/",
    dishes: [
      {
        sourceId: "celler-olive-bonbons",
        name: "Caramelized olive bonbons",
        description: "A playful olive bite with sweet-salty Catalan flavor.",
        imageUrl: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Olive appetizer",
        imageCredit: "Unsplash",
        sourceUrl: "https://cellercanroca.com/"
      },
      {
        sourceId: "celler-charcoal-king-prawn",
        name: "Charcoal-grilled king prawn",
        description: "King prawn with smoky aromatics, seafood essence, and precise garnish.",
        imageUrl: "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Prawn seafood dish",
        imageCredit: "Unsplash",
        sourceUrl: "https://cellercanroca.com/"
      },
      {
        sourceId: "celler-sheep-milk-dessert",
        name: "Sheep's milk ice cream",
        description: "A dairy dessert with wool-inspired aromas and soft textures.",
        imageUrl: "https://images.unsplash.com/photo-1488900128323-21503983a07e?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Ice cream dessert",
        imageCredit: "Unsplash",
        sourceUrl: "https://cellercanroca.com/"
      }
    ]
  },
  {
    source: "curated",
    sourceId: "frantzen-stockholm",
    name: "Frantzen",
    awardType: "3-star",
    cuisine: "Nordic Japanese",
    description: "Stockholm townhouse restaurant combining Nordic ingredients with Japanese technique.",
    city: "Stockholm",
    country: "Sweden",
    latitude: 59.3346,
    longitude: 18.0632,
    websiteUrl: "https://www.restaurantfrantzen.com/",
    sourceUrl: "https://www.restaurantfrantzen.com/",
    dishes: [
      {
        sourceId: "frantzen-truffle-french-toast",
        name: "French toast with truffle",
        description: "A savory-sweet bite with aged cheese, truffle, and precise richness.",
        imageUrl: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Toast with garnish",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.restaurantfrantzen.com/"
      },
      {
        sourceId: "frantzen-langoustine",
        name: "Langoustine with shellfish emulsion",
        description: "Nordic shellfish with warm emulsion, herbs, and citrus.",
        imageUrl: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Langoustine dish",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.restaurantfrantzen.com/"
      },
      {
        sourceId: "frantzen-onion-almond-licorice",
        name: "Onion, almond, and licorice",
        description: "A layered Nordic vegetable course with sweetness, bitterness, and crunch.",
        imageUrl: "https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Vegetable fine dining dish",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.restaurantfrantzen.com/"
      }
    ]
  },
  {
    source: "curated",
    sourceId: "odette-singapore",
    name: "Odette",
    awardType: "3-star",
    cuisine: "Modern French",
    description: "Singapore fine dining restaurant focused on elegant French technique and Asian produce.",
    city: "Singapore",
    country: "Singapore",
    latitude: 1.2905,
    longitude: 103.8515,
    websiteUrl: "https://www.odetterestaurant.com/",
    sourceUrl: "https://www.odetterestaurant.com/",
    dishes: [
      {
        sourceId: "odette-rosemary-smoked-egg",
        name: "Rosemary smoked organic egg",
        description: "Soft egg with smoked potato, chorizo iberico, and rosemary aroma.",
        imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Egg course",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.odetterestaurant.com/"
      },
      {
        sourceId: "odette-hokkaido-uni",
        name: "Hokkaido uni",
        description: "Sea urchin with shellfish jelly and delicate French sauce work.",
        imageUrl: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Seafood course",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.odetterestaurant.com/"
      },
      {
        sourceId: "odette-pigeon",
        name: "Roasted pigeon",
        description: "Pigeon with beetroot, jus, and refined French garnish.",
        imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Roasted bird course",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.odetterestaurant.com/"
      }
    ]
  },
  {
    source: "curated",
    sourceId: "narisawa-tokyo",
    name: "Narisawa",
    awardType: "2-star",
    cuisine: "Innovative Japanese",
    description: "Tokyo restaurant known for sustainability-driven Japanese tasting menus.",
    city: "Tokyo",
    country: "Japan",
    latitude: 35.6626,
    longitude: 139.7201,
    websiteUrl: "https://www.narisawa-yoshihiro.com/",
    sourceUrl: "https://www.narisawa-yoshihiro.com/",
    dishes: [
      {
        sourceId: "narisawa-satoyama-scenery",
        name: "Satoyama Scenery",
        description: "A seasonal plate evoking Japanese forests, soil, moss, and mountain vegetables.",
        imageUrl: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Vegetable landscape course",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.narisawa-yoshihiro.com/"
      },
      {
        sourceId: "narisawa-bread-of-forest",
        name: "Bread of the Forest",
        description: "A tableside bread course inspired by fermentation and forest aromas.",
        imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Rustic bread",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.narisawa-yoshihiro.com/"
      },
      {
        sourceId: "narisawa-langoustine",
        name: "Langoustine with mountain herbs",
        description: "Japanese seafood course with mountain herbs, citrus, and umami.",
        imageUrl: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Langoustine seafood course",
        imageCredit: "Unsplash",
        sourceUrl: "https://www.narisawa-yoshihiro.com/"
      }
    ]
  },
  ...MICHELIN_RESTAURANTS
];
