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
    clientSideID: "609ead905193530d7c28647b",
    context: context,
    options: {
      // allAttributesPrivate is a global setting which will mark all attributes except the context key as private
      // privateAttributes is an array of attributes that will be marked as private
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
      // Enable INFO level logging (INFO, WARN, ERROR only - no DEBUG)
      // Documentation: https://launchdarkly.github.io/js-client-sdk/interfaces/LDOptions.html#logger
      logger: {
        debug: (...args) => console.info('[LaunchDarkly DEBUG]', ...args),
        info: (...args) => console.info('[LaunchDarkly INFO]', ...args),
        warn: (...args) => console.warn('[LaunchDarkly WARN]', ...args),
        error: (...args) => console.error('[LaunchDarkly ERROR]', ...args)
      },
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
