import type { Decorator } from "@storybook/react-vite";

type VisualViewport = {
  width: number;
  height: number;
};

function isVisualViewport(value: unknown): value is VisualViewport {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as VisualViewport).width === "number" &&
    typeof (value as VisualViewport).height === "number" &&
    Number.isFinite((value as VisualViewport).width) &&
    Number.isFinite((value as VisualViewport).height) &&
    (value as VisualViewport).width > 0 &&
    (value as VisualViewport).height > 0
  );
}

export const withVisualFullPage: Decorator = (Story, context) => {
  const fullPage = Boolean(context.parameters.visual?.fullPage);
  const viewport = context.parameters.visual?.viewport;
  const root = document.documentElement;

  if (fullPage) {
    root.dataset.visualFullPage = "true";
  } else {
    root.removeAttribute("data-visual-full-page");
  }

  if (isVisualViewport(viewport)) {
    root.dataset.visualViewport = JSON.stringify({
      width: viewport.width,
      height: viewport.height,
    });
  } else {
    root.removeAttribute("data-visual-viewport");
  }

  return Story();
};
