import { h } from '@stencil/core';

function IconLeft({ fillColor = "#000" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="38"
      fill="none"
      viewBox="0 0 137 228"
    >
      <path fill={fillColor} d="M137 23L114 0 0 114l114 114 23-23-90.8-91" />
    </svg>
  );
}

export default IconLeft;
