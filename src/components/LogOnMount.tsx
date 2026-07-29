"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

/** Demonstrates that the shared logger also works from the browser. */
export function LogOnMount() {
  useEffect(() => {
    logger.info("Home page mounted in the browser");
  }, []);

  return null;
}
