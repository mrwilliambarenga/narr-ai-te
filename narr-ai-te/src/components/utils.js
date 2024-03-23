import rough from "roughjs/bundled/rough.esm";
import { getStroke } from "perfect-freehand";
import { FaPencil, FaRegSquare, FaHandPointer } from "react-icons/fa6";
import { MdShowChart } from "react-icons/md";

const generator = rough.generator();

const toolList = [
  { id: "selection", icon: FaHandPointer, label: "Selection" },
  { id: "line", icon: MdShowChart, label: "Line" },
  { id: "rectangle", icon: FaRegSquare, label: "Rectangle" },
  { id: "pencil", icon: FaPencil, label: "Pencil" },
];

// Helper function to calculate the average of two numbers
const average = (a, b) => (a + b) / 2;

/**
 * Generates an SVG path from a series of stroke points.
 */
const getSvgPathFromStroke = (points, closed = true) => {
  const len = points.length;

  // Return an empty string if there are not enough points to form a path
  if (len < 4) {
    return ``;
  }

  // Initialize the first two points
  let [a, b] = points;
  const c = points[2];

  // Start the path, move to the first point, and initiate a quadratic bezier curve
  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
    2
  )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
    b[1],
    c[1]
  ).toFixed(2)} `;

  // Iterate through points, starting from the third one
  for (let i = 2; i < len - 1; i++) {
    a = points[i];
    b = points[i + 1];
    // Add a smooth quadratic bezier curve segment for each additional point
    result += `T${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(
      2
    )} `;
  }

  // Close the path if requested
  if (closed) {
    result += "Z";
  }

  return result;
};

const drawElement = (roughCanvas, context, element) => {
  switch (element.tool) {
    case "line":
    case "rectangle":
      roughCanvas.draw(element.roughElement);
      break;
    case "pencil":
      const stroke = getSvgPathFromStroke(
        getStroke(element.points, { size: 3 })
      );
      context.fill(new Path2D(stroke));
      break;
    // Add cases for other shapes here
    default:
      throw new Error(`Tool type ${element.tool} not supported.`);
  }
};

/**
 * Creates a new drawing element based on the given parameters and tool type.
 */
const createElement = (id, x1, y1, x2, y2, tool) => {
  let roughElement;
  switch (tool) {
    case "line":
      roughElement = generator.line(x1, y1, x2, y2);
      break;
    case "rectangle":
      roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
      break;
    case "pencil":
      // Add support for pencil drawings here
      return { id, tool, points: [{ x: x1, y: y1 }] };
    // Add cases for other shapes here
    default:
      throw new Error(`Tool type ${tool} not supported.`);
  }
  return { id, x1, y1, x2, y2, tool, roughElement };
};

/**
 * Calculates the Euclidean distance between two points.
 */
const distance = (a, b) => {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
};

/**
 * Determines if a point is near a reference point within a defined threshold.
 */
const nearPoint = (x, y, x1, y1, position) => {
  return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? position : null;
};

const onLine = (x1, y1, x2, y2, x, y, sensitivity = 1) => {
  const a = { x: x1, y: y1 };
  const b = { x: x2, y: y2 };
  const c = { x, y };
  const offset = distance(a, b) - (distance(a, c) + distance(b, c));
  return Math.abs(offset) < sensitivity ? "inside" : null;
};

/**
 * Identifies the relative position of a point within or near a drawing element.
 */
const positionWithinElement = (x, y, element) => {
  const { x1, y1, x2, y2, tool } = element;
  switch (tool) {
    case "line":
      const on = onLine(x1, y1, x2, y2, x, y);
      const start = nearPoint(x, y, x1, y1, "start"); // check if the point is nearest to the start of the line
      const end = nearPoint(x, y, x2, y2, "end"); // check if the point is nearest to the end of the line
      return start || end || on;
    case "rectangle":
      const topLeft = nearPoint(x, y, x1, y1, "tl"); // check if the point is nearest to the top left corner
      const topRight = nearPoint(x, y, x2, y1, "tr"); // check if the point is nearest to the top right corner
      const bottomLeft = nearPoint(x, y, x1, y2, "bl"); // check if the point is nearest to the bottom left corner
      const bottomRight = nearPoint(x, y, x2, y2, "br"); // check if the point is nearest to the bottom right corner
      const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
      return topLeft || topRight || bottomLeft || bottomRight || inside;
    case "pencil":
      const betweenAnyPoint = element.points.some((point, index) => {
        const nextPoint = element.points[index + 1];
        if (!nextPoint) return false;
        return (
          onLine(point.x, point.y, nextPoint.x, nextPoint.y, x, y, 5) !== null
        );
      });
      return betweenAnyPoint ? "inside" : null;
    default:
      throw new Error(`Tool type ${tool} not supported.`);
  }
};

/**
 * Finds the drawing element that a given point intersects with or is nearest to.
 */
const getElementAtPosition = (x, y, elements) => {
  return elements
    .map((element) => ({
      ...element,
      position: positionWithinElement(x, y, element),
    }))
    .find((element) => element.position !== null);
};

/**
 * Adjusts the coordinates of a drawing element to ensure a consistent representation.
 */
const adjustElementCoordinates = (element) => {
  // adjust the coordinates so that x1, y1 is the top left corner and x2, y2 is the bottom right corner
  const { x1, y1, x2, y2, tool } = element;
  if (tool === "rectangle") {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  } else if (tool === "line") {
    if (x1 < x2 || (x1 === x2 && y1 < y2)) {
      return { x1: x1, y1: y1, x2: x2, y2: y2 };
    } else {
      return { x1: x2, y1: y2, x2: x1, y2: y1 };
    }
  } else {
    return { x1, y1, x2, y2 };
  }
};

/**
 * Determines the appropriate cursor style based on the position within or near a drawing element.
 */
const cursorForPosition = (position) => {
  switch (position) {
    case "tl":
    case "br":
      return "nwse-resize";
    case "tr":
    case "bl":
      return "nesw-resize";
    case "start":
    case "end":
      return "ew-resize";
    case "inside":
      return "move";
    default:
      return "default";
  }
};

/**
 * Calculates the updated coordinates for a drawing element being resized.
 */
const resizedCoordinates = (clientX, clientY, position, coordinates) => {
  const { x1, y1, x2, y2 } = coordinates;
  switch (position) {
    case "tl":
    case "start":
      return { x1: clientX, y1: clientY, x2, y2 };
    case "tr":
      return { x1, y1: clientY, x2: clientX, y2 };
    case "bl":
      return { x1: clientX, y1, x2, y2: clientY };
    case "br":
    case "end":
      return { x1, y1, x2: clientX, y2: clientY };
    default:
      return { x1, y1, x2, y2 };
  }
};

const adjustmentRequired = (tool) =>
  toolList.some((toolObj) => toolObj.id === tool) &&
  !["selection", "pencil"].includes(tool);

export {
  toolList,
  drawElement,
  createElement,
  getElementAtPosition,
  adjustElementCoordinates,
  cursorForPosition,
  resizedCoordinates,
  adjustmentRequired,
};
