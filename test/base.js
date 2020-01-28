import { Encoder, Decoder, sha1 } from "../src/index.js";
import t from "tap";

function autoencode(obj) {
  const encoder = new Encoder(sha1);
  const decoder = new Decoder();

  const code = encoder.encode(obj);
  decoder.assign(encoder.commit());
  return decoder.decode(code);
}

t.test("basic types", async t => {
  const obj = {
    undefined: undefined,
    true: true,
    false: false,
    NaN: NaN,
    Infinity: -Infinity,
    number: 7.7e77,
    string: "string",
    null: null,
    array: [1, "2"]
  };
  t.same(autoencode(obj), obj);
});

t.test("empty values", async t => {
  const obj = {
    string: "",
    object: {},
    array: []
  };
  t.same(autoencode(obj), obj);
});

t.test("bigint type", async t => {
  const bigint = BigInt("12345678901234567890123456789012345678901234567890");
  t.equal(autoencode(bigint), bigint);
});

t.test("symbol type", async t => {
  const symbol = Symbol("abc");
  t.equal(autoencode(symbol).toString(), symbol.toString());
});

t.test("self reference", async t => {
  const obj = {};
  obj.obj = obj;
  t.same(autoencode(obj), obj);
});

t.test("circular objects", async t => {
  const obj = {
    a: [
      {
        b: {}
      },
      {
        b: {}
      }
    ],
    c: {}
  };
  obj.c.obj = obj;
  obj.a[0].b.c = obj.c;
  obj.a[1].b.a = obj.a;
  obj.a[1].b.b = obj.a[0].b;
  obj.a[2] = obj.c;
  t.same(autoencode(obj), obj);
});
