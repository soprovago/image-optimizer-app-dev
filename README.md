# Image Optimizer App - Development Version

A web application for optimizing images built with React and Vite.

## Development Setup

This project uses Vite as the build tool with React. Here's what's included:

- React for the UI framework
- Vite for fast development and building
- HMR (Hot Module Replacement) for quick development feedback
- ESLint for code quality

### Available Plugins

The project can use either of these official plugins:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### ESLint Configuration

For production applications, it's recommended to:
- Use TypeScript for better type safety
- Enable type-aware lint rules
- Check the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for TypeScript integration
- Configure [`typescript-eslint`](https://typescript-eslint.io) for enhanced linting
