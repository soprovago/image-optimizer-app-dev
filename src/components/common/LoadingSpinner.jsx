import React from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * LoadingSpinner Component
 * 
 * A reusable loading component that displays a centered spinner with optional text.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {number} [props.size=40] - Size of the CircularProgress in pixels
 * @param {string} [props.color="primary"] - Color of the CircularProgress (primary, secondary, error, info, success, warning)
 * @param {string} [props.text] - Optional loading text to display below the spinner
 * @param {Object} [props.spinnerProps] - Additional props to pass to the CircularProgress component
 * @param {Object} [props.sx] - Additional styles to apply to the container Box
 * @returns {React.ReactElement} The LoadingSpinner component
 */
const LoadingSpinner = ({ 
  size = 40, 
  color = 'primary', 
  text, 
  spinnerProps = {}, 
  sx = {} 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        ...sx
      }}
      data-testid="loading-spinner"
    >
      <CircularProgress 
        size={size} 
        color={color}
        {...spinnerProps} 
      />
      {text && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mt: 2, textAlign: 'center' }}
        >
          {text}
        </Typography>
      )}
    </Box>
  );
};

LoadingSpinner.propTypes = {
  /** Size of the CircularProgress in pixels */
  size: PropTypes.number,
  
  /** Color of the CircularProgress (primary, secondary, error, info, success, warning) */
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'info', 'success', 'warning']),
  
  /** Optional loading text to display below the spinner */
  text: PropTypes.string,
  
  /** Additional props to pass to the CircularProgress component */
  spinnerProps: PropTypes.object,
  
  /** Additional styles to apply to the container Box */
  sx: PropTypes.object
};

export default LoadingSpinner;

