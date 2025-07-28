import { config } from 'dotenv';
config();

// Import all flows to register them
import './flows/answer-mcq-questions';
import './flows/generate-future-self-visualization';
import './flows/generate-mcq-questions';

// Export the AI instance
export { ai } from './genkit';

