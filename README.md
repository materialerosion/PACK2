# PACK2 - Pharmaceutical Packaging Design Application

A sophisticated single-page web application for pharmaceutical packaging design that helps users generate and compare bottle lineups for over-the-counter (OTC) medicine products.

![PACK2 Screenshot](docs/screenshot.png)

## Features

### 🧪 Visual Bottle Generator
- Create realistic 3D-rendered medicine bottles
- Accurate geometric parameters including:
  - Height, diameter, shoulder curve radius
  - Neck dimensions and finish specifications
  - Base profile options (flat, concave, convex, petaloid)
- Multiple bottle shapes:
  - Boston Round
  - Cylinder
  - Oval
  - Modern Pharmaceutical
  - Packer
  - Wide Mouth
- Various cap styles (screw-cap, child-resistant, flip-top, dropper, pump, spray)

### 📐 Precise Volume Calculation
- Mathematical formulas for complex bottle shapes
- Real-time volume calculation as dimensions change
- Surface area calculation for label sizing
- Support for wall thickness in calculations

### 📊 Lineup Builder
- Drag and drop bottles onto virtual shelf display
- Automatic arrangement by volume capacity
- Multiple sorting algorithms:
  - **Linear Progression**: Equal volume increments
  - **Golden Ratio**: φ (1.618) scaling between bottles
  - **Logarithmic**: Logarithmic volume progression
  - **Custom**: Manual drag-and-drop ordering

### 🎯 Visualization Panel
- Realistic 3D rendering with Three.js
- Relative size differences clearly visible
- Optional label placement zones
- Multiple cap style visualizations
- Grid overlay for alignment
- Measurement overlays

### 📋 Comparison Mode
- Save multiple lineup configurations
- Side-by-side comparison view
- Rate lineups on visual harmony and shelf presence
- Add notes and tags to configurations

### 📦 Preset Templates
Common OTC categories with typical volume ranges:
- Pain Relievers (30ml - 500ml)
- Cough Syrups (60ml - 350ml)
- Vitamins & Supplements (75ml - 600ml)
- Antacids (50ml - 500ml)
- Allergy Medicine (30ml - 200ml)
- First Aid (50ml - 250ml)
- Digestive Health (120ml - 400ml)
- Sleep Aids (30ml - 240ml)

### 📤 Export Options
- **PDF Report**: Detailed specifications with visuals
- **Excel Spreadsheet**: Tabular data for analysis
- **Image Export**: PNG screenshots of lineups

## Technology Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Three.js / React Three Fiber** - 3D Rendering
- **Zustand** - State Management
- **Tailwind CSS** - Styling
- **dnd-kit** - Drag and Drop
- **Framer Motion** - Animations
- **jsPDF** - PDF Generation
- **xlsx** - Excel Export
- **Vite** - Build Tool

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pack2.git
cd pack2

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

The production build outputs to the `dist/` directory.

## Deployment

PACK2 is a static single-page application (SPA) that can be deployed to any static hosting service. The build output in `dist/` contains all files needed for deployment.

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to [Vercel](https://vercel.com) for automatic deployments on push.

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

Or drag and drop the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop).

### GitHub Pages

1. Add `base` to `vite.config.ts` if deploying to a subpath:
   ```ts
   base: '/your-repo-name/',
   ```
2. Build and deploy:
   ```bash
   npm run build
   npx gh-pages -d dist
   ```

### Docker

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### SPA Routing

Since this is a single-page application, configure your hosting to redirect all routes to `index.html`. Example `nginx.conf`:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Environment Variables

No environment variables are required for deployment. The application runs entirely client-side.

### Known Security Advisories

- **xlsx**: Has known prototype pollution and ReDoS vulnerabilities with no fix available. The library is used only for Excel export functionality and processes user-generated data only.
- **esbuild/vite**: Dev server vulnerability — does not affect production builds.
- **dompurify/jspdf**: Moderate XSS vulnerability in PDF generation. A fix is available via `jspdf@4.x` (breaking change).

## Project Structure

```
src/
├── components/
│   ├── 3d/                    # Three.js components
│   │   ├── Scene3D.tsx        # Main 3D scene
│   │   ├── Bottle3D.tsx       # Bottle mesh component
│   │   └── Shelf3D.tsx        # Shelf visualization
│   ├── bottle-generator/      # Bottle creation UI
│   ├── lineup-builder/        # Lineup management
│   ├── comparison-mode/       # Comparison features
│   ├── presets/               # Preset templates
│   ├── export/                # Export functionality
│   ├── layout/                # App layout components
│   └── ui/                    # Reusable UI components
├── services/
│   ├── volumeCalculator.ts    # Volume calculation engine
│   ├── lineupAlgorithms.ts    # Sorting algorithms
│   └── exportService.ts       # Export functionality
├── store/
│   └── index.ts               # Zustand store
├── types/
│   ├── bottle.ts              # Bottle type definitions
│   ├── lineup.ts              # Lineup type definitions
│   └── preset.ts              # Preset type definitions
├── data/
│   └── presets/               # Built-in preset data
└── utils/                     # Utility functions
```

## Editable Parameters

Several constants in the codebase control bottle generation behavior. These are designed to be easily modified without deep code changes.

### Bottle Generation Constraints
**File:** `src/services/bottleGenerationService.ts` (lines 20–70)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `MIN_HEIGHT_DIAMETER_RATIO` | 1.2 | Minimum allowed height÷diameter ratio. Prevents bottles from being too squat. |
| `MAX_HEIGHT_DIAMETER_RATIO` | 3.5 | Maximum allowed height÷diameter ratio. Prevents bottles from being too tall. |
| `MIN_HEIGHT_RATIO` | 0.3 | Minimum body height as a fraction of the template's original body height. |
| `MAX_HEIGHT_RATIO` | 3.0 | Maximum body height as a fraction of the template's original body height. |

### Standard Bottle Diameters
**File:** `src/services/bottleGenerationService.ts` — `STANDARD_BOTTLE_DIAMETERS` array

Maps target volume ranges to standard body diameters (mm). The generator picks the appropriate diameter for each bottle's target volume.

| Max Volume (mL) | Diameter (mm) |
|-----------------|---------------|
| 30 | 28 |
| 60 | 33 |
| 120 | 38 |
| 200 | 43 |
| 300 | 48 |
| 500 | 53 |
| 750 | 58 |
| 1000 | 63 |
| 2000 | 75 |

### Standard Cap/Neck Diameters
**File:** `src/services/bottleGenerationService.ts` — `STANDARD_CAP_DIAMETERS` array

Maps bottle body diameters to neck diameters and finish specifications. Neck diameter is approximately body diameter − 8mm for flush cap fit.

| Body Diameter (mm) | Neck Diameter (mm) | Neck Finish |
|--------------------|-------------------|-------------|
| 28 | 20 | 20-400 |
| 33 | 25 | 24-400 |
| 38 | 30 | 28-400 |
| 43 | 35 | 28-400 |
| 48 | 40 | 33-400 |
| 53 | 45 | 33-400 |
| 58 | 50 | 38-400 |
| 63 | 55 | 38-400 |
| 75 | 67 | 45-400 |

### Default Bottle Dimensions (per shape)
**File:** `src/types/bottle.ts` — `DEFAULT_DIMENSIONS` object

Contains default dimensions for each bottle shape. The Boston Round defaults include:
- Shoulder curve radius: 4mm
- Neck height: 5mm
- Neck diameter: 37mm (body diameter − 8mm)
- Body color: `#9696FF` (set in `src/services/bottleGenerationService.ts` and `src/store/index.ts`)

### Default Body Colors
- **Boston Round**: `#9696FF` (light blue, RGB 150/150/255)
- **All other shapes**: `#FFFFFF` (white)

Set in two places:
- **Series generator**: `src/services/bottleGenerationService.ts` — `createTemplateFromShape()` method
- **Single bottle generator**: `src/store/index.ts` — `addBottle()` action

## Usage Guide

### Creating a Bottle

1. Click "New Bottle" in the Bottle Generator panel
2. Select a bottle shape (Boston Round, Cylinder, etc.)
3. Adjust dimensions using the sliders
4. Choose cap style and material
5. Set colors for body and cap
6. View calculated volume in real-time

### Building a Lineup

1. **Generate Bottle Series**: Create a series of bottles simultaneously using intelligent algorithms
   - **Linear Progression**: Equal volume increments between bottles
   - **Golden Ratio**: Each bottle is φ (1.618) times the previous volume
   - **Logarithmic Scale**: Volumes increase logarithmically for optimal coverage
2. **Configure Parameters**:
   - Set volume range (default: 65-700 mL)
   - Choose number of bottles (3-10)
   - Select base bottle template
   - Define target fill percentage range (default: 65-85%)
3. **Batch/Individual Editing**:
   - Batch edit: Modify multiple bottles simultaneously (materials, colors, cap styles)
   - Individual edit: Full parameter editing for any bottle in the series
4. **View Generated Bottles**:
   - 3D shelf visualization showing relative sizes
   - Detailed specifications list
   - Fill range calculations for each bottle
5. **Fill Range Analysis**: For each bottle, see the mL range for target fill percentages
   - Minimum fill (65%): Optimal for smaller quantities
   - Target fill (75%): Recommended fill level
   - Maximum fill (85%): Maximum recommended capacity

### Comparing Lineups

1. **Select Series**: Choose two bottle series to compare
2. **Gap Analysis**: Identify coverage gaps in volume ranges
   - Visual chart showing fill ranges for both series
   - Highlighted gaps where no bottle can accommodate certain volumes
   - Overlap indicators showing redundant coverage
3. **Detailed Comparison Table**:
   - Side-by-side bottle specifications
   - Fill range coverage for each bottle
   - Gap sizes and locations
4. **Coverage Metrics**:
   - Series 1 coverage percentage
   - Series 2 coverage percentage
   - Combined coverage analysis
   - Number and severity of gaps
5. **Recommendations**: AI-generated suggestions for:
   - Filling major coverage gaps
   - Optimizing bottle sizes
   - Reducing excessive overlaps
   - Improving overall lineup efficiency

### Exporting

1. Switch to "Export" tab
2. Select a lineup
3. Choose export format (PDF, Excel, Image)
4. Configure options
5. Click Export

## Volume Calculation Formulas

### Cylinder
```
V = π × r² × h
```

### Truncated Cone (Frustum)
```
V = (π × h / 3) × (r1² + r1×r2 + r2²)
```

### Spherical Cap
```
V = (π × h² / 3) × (3r - h)
```

### Boston Round
Composite of cylinder body + curved shoulder + cylindrical neck - base indent

## Future Features

- **Physics Simulation**: Cannon.js integration for:
  - Pills and capsules simulation
  - Gummy visualization
  - Fill level simulation
  - Stability testing
- **AR Preview**: View bottles in augmented reality
- **Collaboration**: Share lineups with team members
- **Version History**: Track changes to lineups

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Three.js community for 3D rendering examples
- Pharmaceutical packaging industry standards
- React Three Fiber documentation
