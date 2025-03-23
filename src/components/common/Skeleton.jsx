import React from 'react';
import PropTypes from 'prop-types';
import { Skeleton as MuiSkeleton, Box, Card, CardContent, Grid, Avatar } from '@mui/material';

/**
 * Skeleton component for displaying loading placeholders
 * 
 * @component
 * @param {Object} props - Component props
 * @param {('text'|'rectangular'|'circular'|'card'|'list'|'avatar')} [props.variant='rectangular'] - Skeleton variant
 * @param {number} [props.width] - Width of the skeleton (in px or %)
 * @param {number} [props.height] - Height of the skeleton (in px)
 * @param {boolean} [props.animation=true] - Whether to show animation
 * @param {('pulse'|'wave'|false)} [props.animationVariant='pulse'] - Animation variant
 * @param {number} [props.count=1] - Number of skeleton items to display (for list variant)
 * @param {Object} [props.sx] - Additional MUI styles
 * @param {boolean} [props.fullWidth=false] - Whether the skeleton should take full width
 * @returns {React.ReactElement} The Skeleton component
 */
const Skeleton = ({
  variant = 'rectangular',
  width,
  height,
  animation = true,
  animationVariant = 'pulse',
  count = 1,
  sx = {},
  fullWidth = false,
  ...props
}) => {
  // Determine the animation value for MUI Skeleton
  const animationValue = animation ? animationVariant : false;

  // Basic variants handling (text, rectangular, circular)
  if (['text', 'rectangular', 'circular'].includes(variant)) {
    return (
      <MuiSkeleton
        variant={variant}
        width={fullWidth ? '100%' : width}
        height={height}
        animation={animationValue}
        sx={sx}
        {...props}
      />
    );
  }

  // Avatar skeleton
  if (variant === 'avatar') {
    return (
      <MuiSkeleton
        variant="circular"
        width={width || 40}
        height={height || 40}
        animation={animationValue}
        sx={sx}
        {...props}
      />
    );
  }

  // Card skeleton
  if (variant === 'card') {
    return (
      <Card sx={{ width: fullWidth ? '100%' : width || 300, ...sx }} {...props}>
        <MuiSkeleton
          variant="rectangular"
          height={height || 140}
          width="100%"
          animation={animationValue}
        />
        <CardContent>
          <MuiSkeleton animation={animationValue} height={30} width="80%" />
          <MuiSkeleton animation={animationValue} height={20} width="60%" />
          <MuiSkeleton animation={animationValue} height={20} width="90%" />
          <MuiSkeleton animation={animationValue} height={20} width="50%" />
        </CardContent>
      </Card>
    );
  }

  // List skeleton
  if (variant === 'list') {
    return (
      <Box sx={{ width: fullWidth ? '100%' : width || '100%', ...sx }}>
        {Array.from(new Array(count)).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
            <MuiSkeleton
              variant="circular"
              width={40}
              height={40}
              animation={animationValue}
              sx={{ mr: 2 }}
            />
            <Box sx={{ width: '100%' }}>
              <MuiSkeleton animation={animationValue} height={20} width="80%" />
              <MuiSkeleton animation={animationValue} height={20} width="60%" />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  // Grid of skeletons for image galleries or similar layouts
  if (variant === 'grid') {
    return (
      <Grid container spacing={2} sx={sx}>
        {Array.from(new Array(count)).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <MuiSkeleton
              variant="rectangular"
              width="100%"
              height={height || 150}
              animation={animationValue}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  // Default fallback
  return (
    <MuiSkeleton
      variant="rectangular"
      width={fullWidth ? '100%' : width || 210}
      height={height || 118}
      animation={animationValue}
      sx={sx}
      {...props}
    />
  );
};

Skeleton.propTypes = {
  /**
   * The variant of the skeleton
   */
  variant: PropTypes.oneOf(['text', 'rectangular', 'circular', 'card', 'list', 'avatar', 'grid']),
  
  /**
   * Width of the skeleton
   */
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  
  /**
   * Height of the skeleton
   */
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  
  /**
   * Whether to display the animation
   */
  animation: PropTypes.bool,
  
  /**
   * The animation variant to use
   */
  animationVariant: PropTypes.oneOf(['pulse', 'wave', false]),
  
  /**
   * Number of skeleton items to display (for list or grid variants)
   */
  count: PropTypes.number,
  
  /**
   * Additional MUI styles
   */
  sx: PropTypes.object,
  
  /**
   * Whether the skeleton should take full width
   */
  fullWidth: PropTypes.bool,
};

export default Skeleton;

