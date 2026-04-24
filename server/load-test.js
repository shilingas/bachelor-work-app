import http from "k6/http";
import { sleep, check } from "k6";


/*
sum(rate(process_cpu_seconds_total{job="bachelor-app-service"}[1m]))
sum(rate(http_requests_total{job="bachelor-app-service"}[1m]))
avg(process_resident_memory_bytes{job="bachelor-app-service"})
count(up{job="bachelor-app-service"})
 */
export const options = {
  stages: [
    { duration: "2m", target: 5 },    // warm-up
    { duration: "3m", target: 30 },   // normal traffic
    { duration: "2m", target: 100 },  // spike
    { duration: "3m", target: 100 },  // sustained high load
    { duration: "2m", target: 20 },   // drop
    { duration: "2m", target: 0 },    // cooldown
  ],
};

const BASE_URL = "http://bachelor-app-service:3000";

export default function () {
  const endpoints = [
    "/",
    "/health",
    "/items",
    "/slow",
    "/cpu",
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

  let res;

  if (Math.random() < 0.2) {
    res = http.post(
      `${BASE_URL}/items`,
      JSON.stringify({
        name: `item-${Date.now()}`,
        description: "created by k6",
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } else {
    res = http.get(`${BASE_URL}${endpoint}`);
  }

  check(res, {
    "status is 2xx/3xx": (r) => r.status >= 200 && r.status < 400,
  });

  sleep(1);
}
