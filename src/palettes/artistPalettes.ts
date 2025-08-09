import type { Palette } from '../types';

export const artistPalettes: Palette[] = [
  // Susan Kare - Pixel Art Pioneer
  {
    id: 'kare-mac-classic',
    name: 'Mac Classic',
    artist: 'Susan Kare',
    description: 'Original Macintosh 1-bit aesthetic',
    colors: [
      { r: 0, g: 0, b: 0 },       // Black
      { r: 255, g: 255, b: 255 }   // White
    ]
  },
  {
    id: 'kare-chicago',
    name: 'Chicago Bold',
    artist: 'Susan Kare',
    description: 'Early GUI colors with system grays',
    colors: [
      { r: 0, g: 0, b: 0 },       // Black
      { r: 68, g: 68, b: 68 },    // Dark Gray
      { r: 136, g: 136, b: 136 }, // Medium Gray
      { r: 204, g: 204, b: 204 }, // Light Gray
      { r: 255, g: 255, b: 255 }, // White
      { r: 0, g: 99, b: 177 }     // Highlight Blue
    ]
  },

  // Joshua Davis - Generative Art Master
  {
    id: 'davis-praystation',
    name: 'Praystation Era',
    artist: 'Joshua Davis',
    description: 'Electric blues, magentas, acid greens',
    colors: [
      { r: 0, g: 0, b: 0 },       // Black
      { r: 0, g: 255, b: 255 },   // Cyan
      { r: 255, g: 0, b: 255 },   // Magenta
      { r: 0, g: 255, b: 0 },     // Lime
      { r: 255, g: 255, b: 0 },   // Yellow
      { r: 0, g: 128, b: 255 },   // Electric Blue
      { r: 255, g: 0, b: 128 }    // Hot Pink
    ]
  },
  {
    id: 'davis-organic',
    name: 'Once Upon a Forest',
    artist: 'Joshua Davis',
    description: 'Organic earth tones with digital decay',
    colors: [
      { r: 26, g: 28, b: 23 },    // Dark Earth
      { r: 76, g: 63, b: 47 },    // Brown
      { r: 137, g: 105, b: 62 },  // Ochre
      { r: 194, g: 154, b: 108 }, // Sand
      { r: 87, g: 117, b: 68 },   // Forest Green
      { r: 145, g: 170, b: 120 }  // Sage
    ]
  },

  // Kim Asendorf - Glitch Pioneer
  {
    id: 'asendorf-pixel-sort',
    name: 'Pixel Sort Classic',
    artist: 'Kim Asendorf',
    description: 'RGB channel separation aesthetics',
    colors: [
      { r: 0, g: 0, b: 0 },       // Black
      { r: 255, g: 0, b: 0 },     // Pure Red
      { r: 0, g: 255, b: 0 },     // Pure Green
      { r: 0, g: 0, b: 255 },     // Pure Blue
      { r: 255, g: 255, b: 0 },   // Yellow
      { r: 255, g: 0, b: 255 },   // Magenta
      { r: 0, g: 255, b: 255 },   // Cyan
      { r: 255, g: 255, b: 255 }  // White
    ]
  },
  {
    id: 'asendorf-corruption',
    name: 'JPEG Artifact',
    artist: 'Kim Asendorf',
    description: 'Compression artifact colors',
    colors: [
      { r: 8, g: 8, b: 8 },       // Near Black
      { r: 248, g: 248, b: 248 }, // Near White
      { r: 255, g: 0, b: 255 },   // Artifact Magenta
      { r: 0, g: 255, b: 0 },     // Artifact Green
      { r: 128, g: 0, b: 128 },   // Purple Corruption
      { r: 0, g: 128, b: 128 }    // Teal Glitch
    ]
  },

  // Vera Molnár - Algorithmic Art Pioneer
  {
    id: 'molnar-machine',
    name: 'Machine Imaginaire',
    artist: 'Vera Molnár',
    description: 'Plotter pen colors on cream',
    colors: [
      { r: 250, g: 245, b: 235 }, // Cream Paper
      { r: 0, g: 0, b: 0 },       // Black Ink
      { r: 220, g: 20, b: 20 },   // Red Pen
      { r: 20, g: 20, b: 180 }    // Blue Pen
    ]
  },
  {
    id: 'molnar-disorder',
    name: 'Disorder Series',
    artist: 'Vera Molnár',
    description: 'Systematic color progressions',
    colors: [
      { r: 255, g: 255, b: 255 }, // White
      { r: 200, g: 200, b: 200 }, // Light Gray
      { r: 150, g: 150, b: 150 }, // Medium Gray
      { r: 100, g: 100, b: 100 }, // Dark Gray
      { r: 50, g: 50, b: 50 },    // Charcoal
      { r: 0, g: 0, b: 0 }        // Black
    ]
  },

  // Rafael Lozano-Hemmer - Electronic Artist
  {
    id: 'hemmer-pulse',
    name: 'Pulse Room',
    artist: 'Rafael Lozano-Hemmer',
    description: 'Heartbeat reds and medical whites',
    colors: [
      { r: 10, g: 0, b: 0 },      // Deep Blood
      { r: 139, g: 0, b: 0 },     // Dark Red
      { r: 220, g: 20, b: 60 },   // Crimson
      { r: 255, g: 99, b: 71 },   // Coral
      { r: 255, g: 182, b: 193 }, // Light Pink
      { r: 255, g: 250, b: 250 }  // Medical White
    ]
  },
  {
    id: 'hemmer-vectorial',
    name: 'Vectorial Elevation',
    artist: 'Rafael Lozano-Hemmer',
    description: 'Searchlight whites and sky gradients',
    colors: [
      { r: 0, g: 0, b: 20 },      // Night Sky
      { r: 25, g: 25, b: 112 },   // Midnight Blue
      { r: 70, g: 130, b: 180 },  // Steel Blue
      { r: 135, g: 206, b: 235 }, // Sky Blue
      { r: 255, g: 255, b: 224 }, // Light Yellow
      { r: 255, g: 255, b: 255 }  // Searchlight White
    ]
  },

  // JODI.org - Net.Art Pioneers
  {
    id: 'jodi-404',
    name: '404 Errors',
    artist: 'JODI.org',
    description: 'System error colors',
    colors: [
      { r: 0, g: 0, b: 0 },       // Black
      { r: 255, g: 255, b: 255 }, // White
      { r: 255, g: 0, b: 0 },     // Error Red
      { r: 255, g: 255, b: 0 },   // Warning Yellow
      { r: 0, g: 0, b: 255 },     // Link Blue
      { r: 128, g: 128, b: 128 }  // System Gray
    ]
  },
  {
    id: 'jodi-ascii',
    name: 'ASCII Storm',
    artist: 'JODI.org',
    description: 'Terminal green on black',
    colors: [
      { r: 0, g: 0, b: 0 },       // Black Background
      { r: 0, g: 255, b: 0 },     // Bright Green
      { r: 0, g: 192, b: 0 },     // Medium Green
      { r: 0, g: 128, b: 0 },     // Dark Green
      { r: 51, g: 255, b: 51 }    // Matrix Green
    ]
  },

  // Memo Akten - AI/ML Artist
  {
    id: 'akten-neural',
    name: 'Learning to See',
    artist: 'Memo Akten',
    description: 'Neural network activation colors',
    colors: [
      { r: 0, g: 0, b: 0 },       // Input Black
      { r: 64, g: 0, b: 128 },    // Deep Purple
      { r: 138, g: 43, b: 226 },  // Blue Violet
      { r: 255, g: 140, b: 0 },   // Dark Orange
      { r: 255, g: 215, b: 0 },   // Gold
      { r: 255, g: 255, b: 255 }  // Output White
    ]
  },
  {
    id: 'akten-gan',
    name: 'Deep Meditations',
    artist: 'Memo Akten',
    description: 'GAN-generated earth tones',
    colors: [
      { r: 46, g: 34, b: 30 },    // Dark Earth
      { r: 92, g: 64, b: 51 },    // Soil
      { r: 139, g: 90, b: 43 },   // Clay
      { r: 196, g: 164, b: 132 }, // Sand
      { r: 222, g: 184, b: 135 }, // Wheat
      { r: 245, g: 222, b: 179 }  // Cream
    ]
  },

  // Manfred Mohr - Generative Geometry
  {
    id: 'mohr-cubic',
    name: 'Cubic Limit',
    artist: 'Manfred Mohr',
    description: 'Black and white with single accent',
    colors: [
      { r: 255, g: 255, b: 255 }, // White
      { r: 0, g: 0, b: 0 },       // Black
      { r: 255, g: 0, b: 0 }      // Accent Red
    ]
  },
  {
    id: 'mohr-dimensions',
    name: 'Phase Paintings',
    artist: 'Manfred Mohr',
    description: 'Systematic color rotations',
    colors: [
      { r: 255, g: 0, b: 0 },     // Red
      { r: 255, g: 127, b: 0 },   // Orange
      { r: 255, g: 255, b: 0 },   // Yellow
      { r: 0, g: 255, b: 0 },     // Green
      { r: 0, g: 0, b: 255 },     // Blue
      { r: 75, g: 0, b: 130 }     // Indigo
    ]
  },

  // Golan Levin - Interactive Media
  {
    id: 'levin-audiovisual',
    name: 'Audiovisual',
    artist: 'Golan Levin',
    description: 'Sound-responsive grayscale',
    colors: [
      { r: 0, g: 0, b: 0 },       // Silence
      { r: 51, g: 51, b: 51 },    // pp
      { r: 102, g: 102, b: 102 }, // p
      { r: 153, g: 153, b: 153 }, // mf
      { r: 204, g: 204, b: 204 }, // f
      { r: 255, g: 255, b: 255 }  // ff
    ]
  },
  {
    id: 'levin-yellowtail',
    name: 'Yellowtail',
    artist: 'Golan Levin',
    description: 'Gestural yellows and motion blur',
    colors: [
      { r: 0, g: 0, b: 0 },       // Black
      { r: 64, g: 64, b: 64 },    // Dark Gray
      { r: 255, g: 215, b: 0 },   // Gold
      { r: 255, g: 255, b: 0 },   // Yellow
      { r: 255, g: 255, b: 224 }, // Light Yellow
      { r: 255, g: 255, b: 255 }  // White
    ]
  }
];