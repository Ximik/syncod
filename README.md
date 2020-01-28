# syncod

Encode JavaScript objects into flat strings dictionary (similar to the [dictionary coder](https://en.wikipedia.org/wiki/Dictionary_coder) one).
Since the dictionary extends only for new data, it can naturally be used to synchronise complex nested objects between two applications over the network. Works both for mutable and immutable cases and supports circular references.

## Quick start

Install

```js
npm i syncod
```

Encoder

```js
import { Encoder, sha1 } from "syncod";
const encoder = new Encoder(sha1);

const users = [{ id: 1 }, { id: 2 }, { id: 3 }];
const articles = [
  { id: 1, user: users[2] },
  { id: 2, user: users[2] },
  { id: 3, user: users[0] }
];
const state = { users, articles };

const state_enc_1 = encoder.encode(state);
const dict_1 = encoder.commit();

// Send state_enc_1 and dict_1 to Decoder side

state.me = users[0];
users.splice(1, 1);

const state_enc_2 = encoder.encode(state);

// There is no need to make commit right after encoding
// Let's create and encode a new object first

const all_users = users.slice();
all_users.push({ id: 2 });
const all_users_ref_2 = encoder.encode(all_users);

const dict_2 = encoder.commit();
// Dictionary contains only records for the new (all_users) and changed (state, users) objects.
// The recreated object { id: 2 } is regarded as existing and is not put in the dictionary
console.log(dict_2);

// Send state_enc_2, all_users_ref_2 and dict_2 to Decoder side
```

Decoder

```js
import { Decoder, sha1 } from "syncod";
const decoder = new Decoder();

// enc_1 and dict_1 are received from Encoder

decoder.assign(dict_1);
console.log(decoder.decode(state_enc_1));

// state_enc_2, all_users_ref_2 and dict_2 are received from Encoder

decoder.assign(dict_2);
console.log(decoder.decode(state_enc_2));
console.log(decoder.decode(all_users_ref_2));
```

### syncod VS JSON

JSON is just fine if you plan to submit the object just once, but it consumes too much bandwidth if you sync data periodically (or even on each update). Moreover, JSON doesn't support circular references.

### syncod VS flatted

[flatted](https://www.npmjs.com/package/flatted) is like JSON but with circular references. The output array changes significally even on small changes of the object, hence there is no way to calculate nice diffs.

### syncod VS deepdiff

There are a bunch of libraries for deep differences calculation (e.g. [deep-diff](https://www.npmjs.com/package/deep-diff)), but you still have to serialize the result somehow before sending over the wire, solving issues with mutability/immutability and circular references.

## Usage

Create your `Encoder` and `Decoder` instances (normally, they will be inside different applications).

There are two arguments for `Encoder` constructor.

First argument (required) is any hash function, which takes string and returns string. The only restriction is the result characters should be inside `U+0000` - `U+D7FF` range . Package is served with simple `sha1` hash function, which can be used by default.

Second argument (optional) is the minimal length for the string to be saved into the dictionary (by default all strings are put inline). Useful if you have big text values inside your data.

```js
import { Encoder, Decoder, sha1 } from "syncod";

const encoder = new Encoder(sha1, 50);
const decoder = new Decoder();
```

Now `encode` the objects and make `commit` to get the new table entries and send them to the decoder. If the object was encoded, it (or objects inside it) should not be changed before the `commit` call

```js
const enc_1 = encoder.encode(obj_1);
const enc_2 = encoder.encode(obj_2);
// obj_1.key = "value" here can break the data
const dict = encoder.commit();
```

`assign` the dictionary to the `encoder` and `decode` the data

```js
decoder.assign(dict);
console.log(decoder.decode(enc_1));
console.log(decoder.decode(enc_2));
```

## Requirements

`Object.keys` and the basic support of `Map` and `Set` are required (can be polyfilled).
