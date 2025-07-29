import { withLDProvider } from "launchdarkly-react-client-sdk";
import Observability from "@launchdarkly/observability";
import SessionReplay from "@launchdarkly/session-replay";

/**
 * Creates a configured LaunchDarkly provider wrapper
 * @param {Object} context - The LaunchDarkly user context
 * @param {React.Component} Component - The React component to wrap
 * @returns {React.Component} - The wrapped component with LaunchDarkly provider
 */
export function createLDProvider(context, Component) {
  return withLDProvider({
    clientSideID: import.meta.env.VITE_LAUNCHDARKLY_CLIENT_SIDE_ID,
    context: context,
    options: {
      // allAttributesPrivate is a global setting which will mark all attributes except the context key as private
      // privateAttributes is an array of attributes that will be marked as private
      // Note: allAttributesPrivate makes privateAttributes redundant
      // Documentation here: https://launchdarkly.github.io/js-client-sdk/interfaces/LDOptions.html
      allAttributesPrivate: true,
      privateAttributes: [
        "name",
        "email",
        "birthdate",
        "phone",
        "ssn",
        "healthPlan",
        "accountNumber",
        "address",
      ],
      plugins: [
        new Observability({
          // Optional observability plugin
          // Configuration options: https://launchdarkly.com/docs/sdk/features/observability-config-client-side#javascript
          tracingOrigins: true,
          networkRecording: {
            enabled: true,
            recordHeadersAndBody: true,
          },
        }),
        // Optional session replay plugin
        // Configuration options: https://launchdarkly.com/docs/sdk/features/session-replay-config#javascript
        new SessionReplay({ privacySetting: "strict" }),
      ],
    },
  })(Component);
}

/**
 * Creates a LaunchDarkly provider with custom configuration
 * @param {Object} config - Custom LaunchDarkly configuration
 * @param {Object} context - The LaunchDarkly user context
 * @param {React.Component} Component - The React component to wrap
 * @returns {React.Component} - The wrapped component with LaunchDarkly provider
 */
export function createCustomLDProvider(config, context, Component) {
  return withLDProvider({
    ...config,
    context: context,
  })(Component);
}
