import { h } from '@stencil/core';

function IconRight({ fillColor = "#000" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="38"
      fill="none"
      viewBox="0 0 192 320"
    >
      <path
        fill={fillColor}
        d="M0 32.4L32.3 0 192 160 32.3 320 0 287.6 127.3 160 0 32.4z"
      />
    </svg>
  );
}

export default IconRight;
