import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { withLDProvider } from 'launchdarkly-react-client-sdk'
import Observability from "@launchdarkly/observability";
import SessionReplay from "@launchdarkly/session-replay";
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

// Function to generate randomized context attributes
function generateRandomContext() {
  const healthPlans = [
    'Blue Cross Blue Shield',
    'Aetna',
    'Cigna',
    'Humana',
    'Kaiser Permanente',
    'United Healthcare',
    'Anthem',
    'Molina Healthcare'
  ];

  return {
    key: uuidv4(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    birthdate: faker.date.between({ from: '1950-01-01', to: '2000-12-31' }).toISOString().split('T')[0],
    phone: faker.phone.number(),
    ssn: faker.string.numeric(3) + '-' + faker.string.numeric(2) + '-' + faker.string.numeric(4),
    healthPlan: faker.helpers.arrayElement(healthPlans),
    accountNumber: faker.string.numeric(10),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.stateAbbr(),
      zip: faker.location.zipCode(),
    }
  };
}

// Function to construct LaunchDarkly context from random data
function buildLaunchDarklyContext(randomData) {
  return {
    kind: "user",
    key: randomData.key,
    name: randomData.name,
    email: randomData.email,
    birthdate: randomData.birthdate,
    phone: randomData.phone,
    ssn: randomData.ssn,
    healthPlan: randomData.healthPlan,
    accountNumber: randomData.accountNumber,
    address: {
      street: randomData.address.street,
      city: randomData.address.city,
      state: randomData.address.state,
      zip: randomData.address.zip,
    }
  };
}

const randomUserData = generateRandomContext();
const context = buildLaunchDarklyContext(randomUserData);

const LDProvider = withLDProvider({
  clientSideID: "609ead905193530d7c28647b",
  context: context,
  options: {
    // allAttributesPrivate is a global setting which will mark all attributes except the context key as private
    // privateAttributes is an array of attributes that will be marked as private
    // Documentation here: https://launchdarkly.github.io/js-client-sdk/interfaces/LDOptions.html
    allAttributesPrivate: true,
    privateAttributes: ["name", "email", "birthdate", "phone", "ssn", "healthPlan", "accountNumber", "address"],
    plugins: [
      new Observability({ // Optional observability plugin
        tracingOrigins: true,
        networkRecording: {
          enabled: true,
          recordHeadersAndBody: true,
        },
      }),
      new SessionReplay(), // Optional session replay plugin
    ],
  },
})(App);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LDProvider />
  </StrictMode>,
)
