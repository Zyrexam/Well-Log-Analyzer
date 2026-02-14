# OneGeo - Well Log Analysis Platform

A modern web-based system for analyzing subsurface well-log data with visualization, AI-assisted interpretation, and interactive chatbot.

## Features

- **File Upload**: Drag-and-drop LAS file uploads
- **Visualization**: Interactive charts with curve selection, depth range control, and zoom/pan
- **AI Interpretation**: AI-powered analysis of well data
- **Chatbot**: Conversational interface for data-driven questions (Bonus)
- **Well Info**: Detailed metadata and curve information

## Tech Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Styling**: Custom CSS with dark theme

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This installs:

- `react` & `react-dom` - React framework
- `react-router-dom` - Client-side routing
- `recharts` - Chart library
- `axios` - HTTP client

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8000
```

Replace with your backend API URL.

### 3. Run Development Server

```bash
npm run dev
```

The app will start at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

Output is in the `dist/` folder.

## Project Structure

```
src/
├── pages/
│   ├── HomePage.jsx           # Welcome page
│   ├── HomePage.css
│   ├── UploadPage.jsx         # File upload
│   ├── UploadPage.css
│   ├── DashboardPage.jsx      # Main dashboard
│   └── DashboardPage.css
│
├── components/
│   ├── Header.jsx             # Top header
│   ├── Sidebar.jsx            # Navigation sidebar
│   ├── VisualizationTab.jsx   # Chart visualization
│   ├── VisualizationTab.css
│   ├── InterpretationTab.jsx  # AI analysis
│   ├── InterpretationTab.css
│   ├── ChatbotTab.jsx         # GeoBot chat
│   ├── ChatbotTab.css
│   ├── WellInfoTab.jsx        # Well metadata
│   └── WellInfoTab.css
│
├── App.jsx                     # Main app with routing
├── App.css
├── index.css                   # Global styles
└── main.jsx                    # Entry point
```

## Pages

### 1. HomePage

Welcome page with feature overview and CTA button to start analyzing.

### 2. UploadPage

- Drag-and-drop zone for LAS files
- Progress indicator during upload
- Success summary with well metadata
- "How It Works" guide

### 3. DashboardPage

Main analysis interface with 4 tabs:

#### Visualization Tab

- Interactive depth curve visualization
- Curve selection with search
- Depth range input
- Downsampling control
- Statistics panel
- Zoom/pan with Recharts Brush

#### Interpretation Tab

- Select depth range and curves
- AI-powered analysis button
- Results with markdown rendering
- Statistics summary
- Past interpretations history

#### Chatbot Tab (Bonus)

- Conversational chat interface
- Starter questions
- Chat history
- Clear history button
- Typing indicator

#### Well Info Tab

- Complete well metadata
- All available curves
- Danger zone for well deletion

## API Integration

The frontend communicates with a backend API. Required endpoints:

```
GET  /wells                              # List all wells
GET  /wells/{id}                         # Get well details
GET  /wells/{id}/data?curves=...         # Get well data for curves
POST /upload                             # Upload LAS file
POST /interpret                          # AI interpretation
GET  /wells/{id}/interpretations         # Past interpretations
GET  /wells/{id}/chat/history            # Chat history
POST /chat                               # Send chat message
DELETE /wells/{id}/chat/history          # Clear chat history
DELETE /wells/{id}                       # Delete well
```

## Styling

Dark theme with Amber (⬡) and Teal accents, inspired by professional engineering platforms.

### CSS Variables

- Colors: `--bg-dark`, `--text-bright`, `--accent-amber`, etc.
- Fonts: `--font-sans`, `--font-mono`
- Sizing: `--radius-md`, `--spacing-lg`

## Features Breakdown

### Responsive Design

- Mobile-friendly layout
- Sidebar collapse on mobile
- Grid layouts adapt to screen size

### Error Handling

- Upload validation (.las files only)
- API error messages
- User-friendly alerts

### Loading States

- Progress bar for uploads
- Thinking indicator for AI requests
- Disabled buttons during requests

### Accessibility

- Semantic HTML
- Keyboard navigation
- Focus states on buttons/inputs
- ARIA labels where needed

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Performance

- Code splitting via Vite
- Lazy loading of chart data
- Efficient state management
- Optimized re-renders

## Future Enhancements

- User authentication
- Save interpretations locally
- Export charts as PNG/PDF
- Dark/light theme toggle
- Multi-language support
- Real-time collaboration

## License

Private

## Support

For issues or questions, contact the development team.
