import { describe, it, expect } from "vitest";
import migrateConfiguration from "./migrateConfiguration";
import {
  createRandomBoolean,
  createRandomInteger,
  createRandomName,
  createRandomUrlString,
  pickRandomElement,
  randomlyUndefined,
} from "../../utils/testing";

describe("migrateConfiguration", () => {
  const proxyServerUrl = createRandomUrlString();
  const databaseUrl = createRandomUrlString();

  const storedConfigBase = {
    id: createRandomName("id"),
    displayLabel: createRandomName("displayLabel"),
    __fileBase: randomlyUndefined(createRandomBoolean()),
    connection: {
      queryEngine: pickRandomElement([
        "gremlin",
        "openCypher",
        "sparql",
        undefined,
      ]),
      fetchTimeoutMs: randomlyUndefined(createRandomInteger(240000)),
      nodeExpansionLimit: randomlyUndefined(createRandomInteger(1000)),
      awsAuthEnabled: createRandomBoolean(),
      awsRegion: pickRandomElement(["us-east-1", "us-east-2", undefined]),
      serviceType: pickRandomElement([
        "neptune-db",
        "neptune-graph",
        undefined,
      ]),
    },
  };

  it("should convert config with proxy connection", () => {
    const storedConfigMap = new Map([
      [
        storedConfigBase.id,
        {
          ...storedConfigBase,
          connection: {
            ...storedConfigBase.connection,
            graphDbUrl: databaseUrl,
            proxyConnection: true,
            url: proxyServerUrl,
          },
        },
      ],
    ]);
    const result = migrateConfiguration(storedConfigMap);
    expect(result).toEqual(
      new Map([
        [
          storedConfigBase.id,
          {
            ...storedConfigBase,
            connection: {
              ...storedConfigBase.connection,
              graphDbUrl: databaseUrl,
            },
          },
        ],
      ])
    );
  });

  it("should convert config without proxy connection", () => {
    const storedConfigMap = new Map([
      [
        storedConfigBase.id,
        {
          ...storedConfigBase,
          connection: {
            ...storedConfigBase.connection,
            proxyConnection: false,
            url: databaseUrl,
          },
        },
      ],
    ]);
    const result = migrateConfiguration(storedConfigMap);
    expect(result).toEqual(
      new Map([
        [
          storedConfigBase.id,
          {
            ...storedConfigBase,
            connection: {
              ...storedConfigBase.connection,
              graphDbUrl: databaseUrl,
            },
          },
        ],
      ])
    );
  });

  it("should do nothing with already converted configs", () => {
    const storedConfigMap = new Map([
      [
        storedConfigBase.id,
        {
          ...storedConfigBase,
          connection: {
            ...storedConfigBase.connection,
            graphDbUrl: databaseUrl,
          },
        },
      ],
    ]);
    const result = migrateConfiguration(storedConfigMap);
    expect(result).toEqual(
      new Map([
        [
          storedConfigBase.id,
          {
            ...storedConfigBase,
            connection: {
              ...storedConfigBase.connection,
              graphDbUrl: databaseUrl,
            },
          },
        ],
      ])
    );
  });
});
