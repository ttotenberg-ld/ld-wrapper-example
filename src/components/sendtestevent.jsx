import { useLDClient } from 'launchdarkly-react-client-sdk';

const TestEvent = () => {
  const ldClient = useLDClient();

  const sendTestEvent = () => {
    ldClient.track("test-event", {
      customProperty: "test-value",
    });
  };
  return <button onClick={sendTestEvent}>Send Test Event</button>;
};

export default TestEvent;
