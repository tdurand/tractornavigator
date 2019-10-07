import { h } from '@stencil/core';

const IconArrow = ({ direction, fillColor }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="38"
      fill="none"
      viewBox="0 0 406 379"
    >
      {direction === "left" &&
        <g fill={fillColor}>
          <path
            d="M189.2.8l42.4 42.4L84.8 190l146.8 146.8-42.4 42.4L0 190 189.2.8z"
          />
          <path
            d="M363.6.8L406 43.2 259.2 190 406 336.8l-42.4 42.4L174.4 190 363.6.8z"
          />
        </g>
      }
      {direction === "right" &&
        <g fill={fillColor}>
          <path
            d="M216.8 378.4L174.4 336l146.8-146.8L174.4 42.4 216.8 0 406 189.2 216.8 378.4z"
          />
          <path
            d="M42.4 378.4L0 336l146.8-146.8L0 42.4 42.4 0l189.2 189.2L42.4 378.4z"
          />
        </g>
      }
    </svg>
  );
}

export default IconArrow;
