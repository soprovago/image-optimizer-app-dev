# Image Optimizer App - Development Version

## Project Overview

Image Optimizer App is a web application designed to help users optimize and process images efficiently. The application provides a user-friendly interface for uploading, processing, and downloading optimized images, reducing file sizes while maintaining quality. This tool is ideal for web developers, content creators, and anyone who needs to optimize images for web usage.

## Features

- **User Authentication**: Secure login and registration system
- **Dashboard Interface**: Clean, intuitive user interface with Material-UI components
- **Image Optimization**: Compress and optimize images with customizable settings
- **Batch Processing**: Process multiple images simultaneously
- **Preview Functionality**: Compare original and optimized images
- **Download Options**: Download individual or all processed images
- **User Profiles**: Save preferences and history
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Toggle between dark and light themes

## Technology Stack

- **Frontend Framework**: React.js with Vite
- **UI Library**: Material-UI (MUI)
- **Styling**: CSS-in-JS with MUI's styling solution
- **State Management**: React Context API
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage
- **Image Processing**: Browser-based image processing libraries
- **Build Tool**: Vite
- **Testing**: Jest and React Testing Library
- **Deployment**: Firebase Hosting (or your preferred hosting)

## Project Structure

```
src/
├── assets/            # Static assets (images, icons, etc.)
│   └── react.svg      # Logo file
├── components/        # React components organized by feature
│   ├── auth/          # Authentication related components
│   ├── dashboard/     # Dashboard and main app components
│   └── imageOptimizer/# Image optimization components
├── contexts/          # React Context providers
├── services/          # External service integrations
│   ├── firebase.js    # Firebase configuration
│   └── imageService.js# Image processing service
└── styles/            # Global styles and theming
    └── theme.js       # Material-UI theme configuration
```

## Development Setup

This project uses Vite as the build tool with React, providing:
- Fast development server with HMR (Hot Module Replacement)
- Optimized production builds
- Modern development experience

### Prerequisites
- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Installation Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/soprovago/image-optimizer-app-dev.git
   cd image-optimizer-app-dev
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add necessary environment variables

4. Start the development server:
   ```bash
   npm run dev
   ```

### Available Plugins

The project can use either of these official Vite plugins:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### ESLint Configuration

For production applications, it's recommended to:
- Use TypeScript for better type safety
- Enable type-aware lint rules
- Check the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for TypeScript integration
- Configure [`typescript-eslint`](https://typescript-eslint.io) for enhanced linting

## License
This project is licensed under the MIT License - see the LICENSE file for details.
