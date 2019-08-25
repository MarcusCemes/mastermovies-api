import { createConfig } from "./utils";

export const GlacierConfig = createConfig("GlacierConfig", {
  contentPath: {
    doc: "The path to stored Glacier content",
    format: String,
    default: "/var/glacier",
    env: "GLACIER_CONTENT_PATH"
  },
  authorisationLifetime: {
    doc: "How long a film authorisation should last (seconds)",
    format: Number,
    default: 86400,
    env: "GLACIER_AUTHORISATION_LIFETIME"
  }
});
