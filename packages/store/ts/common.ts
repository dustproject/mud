import { SchemaAbiType, SchemaAbiTypeToPrimitiveType, StaticAbiType } from "@latticexyz/schema-type/internal";

export type KeySchema = {
  readonly [k: string]: {
    readonly type: StaticAbiType;
  };
};
export type ValueSchema = {
  readonly [k: string]: {
    readonly type: SchemaAbiType;
  };
};

/** Map a table schema like `{ value: { type: "uint256" } }` to its primitive types like `{ value: bigint }` */
export type SchemaToPrimitives<schema extends ValueSchema> = {
  readonly [key in keyof schema]: SchemaAbiTypeToPrimitiveType<schema[key]["type"]>;
};

export const emptyRecord = {
  staticData: "0x",
  encodedLengths: "0x",
  dynamicData: "0x",
} as const;
