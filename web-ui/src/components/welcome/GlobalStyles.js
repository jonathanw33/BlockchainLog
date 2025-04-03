import React from 'react';
import { GlobalStyles as MuiGlobalStyles } from '@mui/material';

const GlobalStyles = () => {
  return (
    <MuiGlobalStyles
      styles={{
        '@import': 'url("https://use.typekit.net/xyx1hha.css")', // This assumes you have access to Proxima Nova through Adobe Fonts
        'body, html': {
          margin: 0,
          padding: 0,
          fontFamily: '"Proxima Nova", "Helvetica Neue", Helvetica, Arial, sans-serif',
        },
        '*': {
          fontFamily: '"Proxima Nova", "Helvetica Neue", Helvetica, Arial, sans-serif',
          boxSizing: 'border-box',
        },
        'h1, h2, h3, h4, h5, h6': {
          fontFamily: '"Proxima Nova", "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontWeight: 600,
        },
      }}
    />
  );
};

export default GlobalStyles;
