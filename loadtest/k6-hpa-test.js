import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 50 },
    { duration: '20s', target: 50 },
    { duration: '20s', target: 0 },
  ],
};

const TARGET_URL = __ENV.TARGET_URL || 'http://57.153.89.94/load?n=300000';

export default function () {
  http.get(TARGET_URL);
  sleep(0.1);
}
