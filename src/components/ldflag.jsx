import { withLDConsumer } from 'launchdarkly-react-client-sdk';

const LDFlag = ({ flags }) => {

  return flags.sampleFlag ? <div>Flag on</div> : <div>Flag off</div>;
};

const LDFlagWithConsumer = withLDConsumer()(LDFlag);
LDFlagWithConsumer.displayName = 'LDFlagWithConsumer';

export default LDFlagWithConsumer;
