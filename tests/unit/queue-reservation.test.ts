jest.mock("../../src/services/s3", () => ({
  s3Put: jest.fn(),
  s3Get: jest.fn(),
  s3GetIfExists: jest.fn(),
}));

import { getQueueNumber } from "../../src/functions/storage/helpers";
import {
  isIssuedReservationId,
  reservationKeyFor,
} from "../../src/functions/storage/reservationKey";
import { s3Put } from "../../src/services/s3";

describe("getQueueNumber", () => {
  beforeEach(() => {
    process.env.STORAGE_RESERVATION_SECRET = "test-reservation-secret";
    jest.clearAllMocks();
  });

  it("returns an id and key without writing an object", async () => {
    const result = await getQueueNumber();

    expect(result.key).toBe(reservationKeyFor(result.id));
    expect(isIssuedReservationId(result.id)).toBe(true);
    expect(s3Put).not.toHaveBeenCalled();
  });
});
