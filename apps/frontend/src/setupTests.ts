import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

// Mock next/image to render a standard <img> element in jsdom
vi.mock("next/image", () => ({
  default: ({ src, alt, fill, priority, ...rest }: any) => {
    return React.createElement("img", {
      src,
      alt: alt || "",
      ...rest,
    });
  },
}));

// Mock next/link to render a standard <a> element in jsdom
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: any) => {
    return React.createElement(
      "a",
      {
        href: typeof href === "object" ? href.pathname : href,
        ...rest,
      },
      children
    );
  },
}));
