import { Encoder, Decoder, sha1 } from "../src/index.js";
import t from "tap";

t.test("example from readme", async t => {
  const encoder = new Encoder(sha1);
  const decoder = new Decoder();

  const users = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const articles = [
    { id: 1, user: users[2] },
    { id: 2, user: users[2] },
    { id: 3, user: users[0] }
  ];
  const state = { users, articles };

  const state_enc_1 = encoder.encode(state);
  const dict_1 = encoder.commit();

  decoder.assign(dict_1);
  t.same(decoder.decode(state_enc_1), state);

  state.me = users[0];
  users.splice(1, 1);

  const state_enc_2 = encoder.encode(state);

  const all_users = users.slice();
  all_users.push({ id: 2 });
  const all_users_ref_2 = encoder.encode(all_users);

  const dict_2 = encoder.commit();
  t.equal(Object.keys(dict_2).length, 3);

  decoder.assign(dict_2);
  t.same(decoder.decode(state_enc_2), state);
  t.same(decoder.decode(all_users_ref_2), all_users);
});
