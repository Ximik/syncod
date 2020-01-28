import { Encoder, Decoder, sha1 } from "../src/index.js";
import t from "tap";

t.test("root object change", async t => {
  const encoder = new Encoder(sha1);
  const obj = {
    a: [
      {
        b: "b",
        c: {
          d: 1,
          e: null
        },
        f: [1, 2]
      }
    ]
  };
  encoder.encode(obj);
  encoder.commit();
  obj.new = "new";
  encoder.encode(obj);
  t.equal(Object.keys(encoder.commit()).length, 1);
});

t.test("depth change", async t => {
  const encoder = new Encoder(sha1);
  const obj = {};
  obj.self = obj;
  encoder.encode(obj);
  encoder.commit();
  const obj2 = { obj };
  encoder.encode(obj2);
  t.equal(Object.keys(encoder.commit()).length, 1);
});

t.test("list splice with circular", async t => {
  const encoder = new Encoder(sha1);
  const obj = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }];
  obj[0].p = obj[2];
  obj[2].p = obj[3];
  encoder.encode(obj);
  encoder.commit();
  obj.splice(1, 1);
  obj.push({ id: 4, p: obj[3] });
  encoder.encode(obj);
  t.equal(Object.keys(encoder.commit()).length, 2);
});
