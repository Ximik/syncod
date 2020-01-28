import { Encoder, Decoder, sha1 } from "../src/index.js";
import chars from "../src/chars.js";
import t from "tap";

function autoencode(obj, slen) {
  const encoder = new Encoder(sha1, slen);
  const decoder = new Decoder();

  const code = encoder.encode(obj);
  const dict = encoder.commit();
  decoder.assign(dict);
  return {
    res: decoder.decode(code),
    size: Object.keys(dict).length
  };
}

const string =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas lobortis vitae ex.";
const string_with_del =
  "Lorem ipsum dolor sit amet, " +
  chars.DEL +
  "consectetur adipiscing elit. Praesent at gravida nisl.";
const obj = { string, string_with_del };

t.test("long strings without hashing", async t => {
  const { res, size } = autoencode(obj);
  t.same(res, obj);
  t.equal(size, 2);
});

t.test("long strings with hashing", async t => {
  const { res, size } = autoencode(obj, 30);
  t.same(res, obj);
  t.equal(size, 3);
});

t.test("long object key", async t => {
  const { res, size } = autoencode(obj, 10);
  t.same(res, obj);
  t.equal(size, 4);
});
