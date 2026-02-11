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

## Usage Guide

### Creating a Bottle

1. Click "New Bottle" in the Bottle Generator panel
2. Select a bottle shape (Boston Round, Cylinder, etc.)
3. Adjust dimensions using the sliders
4. Choose cap style and material
5. Set colors for body and cap
6. View calculated volume in real-time

### Building a Lineup

1. Switch to "Lineup Builder" tab
2. Create a new lineup or select existing
3. Add bottles from the library
4. Choose sorting algorithm
5. Adjust spacing and alignment
6. Drag bottles to reorder (in custom mode)

### Comparing Lineups

1. Switch to "Compare" tab
2. Select multiple lineups to compare
3. View side-by-side specifications
4. Rate each lineup
5. Add comparison notes

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
