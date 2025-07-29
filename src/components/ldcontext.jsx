import { useLDClient } from 'launchdarkly-react-client-sdk';

const LDContext = () => {
  const ldClient = useLDClient();
  
  // Handle case where client is not yet initialized
  if (!ldClient) {
    return <div>Loading LaunchDarkly client...</div>;
  }
  
  try {
    const context = ldClient.getContext();
    return (
      <div>
        <strong>Raw launchdarkly context:</strong>
        <pre style={{ fontSize: '12px', textAlign: 'left', overflow: 'auto' }}>
          {JSON.stringify(context, null, 2)}
        </pre>
      </div>
    );
  } catch (error) {
    return <div>Error loading context: {error.message}</div>;
  }
};

export default LDContext;