# Migrate to v0.31.0

You can use [Grit](https://docs.grit.io/cli/quickstart) to automatically update your code to the new API. See the [migration guide](https://valibot.dev/guides/migrate-from-v0.30.0/) for more details on the changes.

```grit
language js

pattern rewrite_names() {
  or {
    `custom` => `check`,
    `BaseSchema` => `GenericSchema`,
    `Input` => `InferInput`,
    `Output` => `InferOutput`,
    `SchemaConfig` => `Config`,
    `special` => `custom`,
    `toCustom` => `transform`,
    `toTrimmed` => `trim`,
    `toTrimmedEnd` => `trimEnd`,
    `toTrimmedStart` => `trimStart`
  }
}

pattern schema_names() {
  or {
    `any`, `array`, `bigint`, `blob`, `boolean`, `custom`, `date`, `enum_`, `instance`, `intersect`, `lazy`, `literal`, `looseObject`, `looseTuple`, `map`, `nan`, `never`, `nonNullable`, `nonNullish`, `nonOptional`, `null_`, `nullable`, `nullish`, `number`, `object`, `objectWithRest`, `optional`, `picklist`, `record`, `set`, `strictObject`, `strictTuple`, `string`, `symbol`, `tuple`, `tupleWithRest`, `undefined_`, `union`, `unknown`, `variant`, `void_`
  }
}

// These schemas have a mandatory array argument that is not a pipeline
pattern schema_names_with_array_arg() {
  or {
    `union`, `intersect`, `tuple`, `picklist`, `variant`
  }
}

pattern extract_pipe_args($schema, $new_schema_args, $pipe_args) {
  or {
    [$maybe_pipe] where $other_args = [],
    [$one_arg, $maybe_pipe] where $other_args = [$one_arg],
    [$one_arg, $two_arg, $maybe_pipe] where $other_args = [$one_arg, $two_arg],
    [$one_arg, $two_arg, $three_arg, $maybe_pipe] where $other_args = [$one_arg, $two_arg, $three_arg]
  } where {
    $maybe_pipe <: `[$pipe_args]` where {
      or {
        $schema <: not schema_names_with_array_arg(),
        // Skip mandatory array arguments
        and {
          $schema <: schema_names_with_array_arg(),
          $one_arg <: not undefined,
          if ($schema <: `variant`) {
            $two_arg <: not undefined
          }
        },
      }
    },
    $new_schema_args = join($other_args, `,`)
  }
}

pattern rewrite_pipes($v, $pipe_args) {
  or {
    `$v.$schema($schema_args)` where {
      $schema <: schema_names(),
      $schema_args <: extract_pipe_args($schema, $new_schema_args, $pipe_args)
    } => `$v.pipe($v.$schema($new_schema_args), $pipe_args)`,
    `$schema($schema_args)` where {
      $schema <: schema_names(),
      $schema_args <: extract_pipe_args($schema, $new_schema_args, $pipe_args),
      add_import(`pipe`, `'valibot'`)
    } => `pipe($schema($new_schema_args), $pipe_args)`
  }
}

pattern rewrite_brand_and_transform($v, $schema, $pipe_args) {
  `$v.$method($schema, $method_arg)` as $outer where {
    $method <: or {`brand`, `transform`},
    or {
      and {
        $schema <: rewrite_pipes($v, $pipe_args),
        $pipe_args += `, $v.$method($method_arg)`,
        $outer => $schema
      },
      and {
        // Handle nested case
        $schema <: bubble($outer, $v, $method, $method_arg) rewrite_brand_and_transform(v=$_, $schema, $pipe_args) where {
          $pipe_args += `, $v.$method($method_arg)`,
          $outer => `$v.pipe($schema, $pipe_args)`
        }
      },
      and {
        $pipe_args = `$v.$method($method_arg)`,
        $outer => `$v.pipe($schema, $pipe_args)`
      }
    }
  }
}

pattern rewrite_coerce($v) {
  `$v.coerce($schema, $fn)` => `$v.pipe($v.unknown(), $v.transform($fn))`
}

pattern rewrite_flatten($v) {
  `$flatten($error)`  => `$flatten($error.issues)` where {
    $error <: identifier(),
    $flatten <: or {
      `flatten`,
      `$v.flatten`
    }
  }
}

pattern rewrite_nested_pipes($v, $args) {
  `$v.pipe($args)` where {
    $args <: maybe contains bubble($args) rewrite_nested_pipes($v, args=$inner) => $inner
  }
}

any {
  rewrite_names(),
  rewrite_pipes($v),
  rewrite_brand_and_transform($v),
  rewrite_coerce($v),
  rewrite_flatten($v),
  rewrite_nested_pipes($v),
} where {
  $v <: or {
    // Direct imports
    undefined,
    // Default wildcard specification
    `v`,
    // Other wildcard imports
    identifier() where $program <: contains `import * as $v from 'valibot'`
  }
}
```

## Should transform simple pipe

Before:

```javascript
const Schema1 = v.string([v.email('Email required')]);
const Schema2 = v.string([v.email(), v.endsWith('@example.com')]);
const Schema3 = v.string([v.email(), v.endsWith('@example.com'), v.maxLength(30)]);
```

After:

```javascript
const Schema1 = v.pipe(v.string(), v.email('Email required'));
const Schema2 = v.pipe(v.string(), v.email(), v.endsWith('@example.com'));
const Schema3 = v.pipe(v.string(), v.email(), v.endsWith('@example.com'), v.maxLength(30));
```

## Should transform nested pipe

Before:

```javascript
const Schema1 = v.map(
  v.number(),
  v.string([v.url(), v.endsWith('@example.com')]),
  [v.maxSize(10)]
);

const Schema2 = v.object(
  {
    list: v.array(
      v.string([v.minLength(3)]),
      [v.minLength(3), v.includes('foo')]
    ),
    length: v.number([v.integer()]),
  },
  [v.custom((input) => input.list.length === input.length)],
);
```

After:

```javascript
const Schema1 = v.pipe(v.map(v.number(),v.pipe(v.string(), v.url(), v.endsWith('@example.com'))), v.maxSize(10));

const Schema2 = v.pipe(v.object({
    list: v.pipe(v.array(v.pipe(v.string(), v.minLength(3))), v.minLength(3), v.includes('foo')),
    length: v.pipe(v.number(), v.integer()),
  }), v.check((input) => input.list.length === input.length));
```

## Should not transform non pipe

Before:

```js
const Schema = v.object({
  normal: v.string([v.email(() => 'Email required')]),
  union: v.union([v.string([v.decimal()]), v.number()], [v.minValue(10)]),
  intersection: v.intersect([v.object({ a: v.string() }), v.object({ b: v.number() })]),
  variant: v.variant('type', [v.object({ type: v.literal('a') }), v.object({ type: v.literal('b') })]),
  picklist: v.picklist(['a', 'b']),
  tuple: v.tuple([v.string(), v.number()]),
});
```

After:

```js
const Schema = v.object({
  normal: v.pipe(v.string(), v.email(() => 'Email required')),
  union: v.pipe(v.union([v.pipe(v.string(), v.decimal()), v.number()]), v.minValue(10)),
  intersection: v.intersect([v.object({ a: v.string() }), v.object({ b: v.number() })]),
  variant: v.variant('type', [v.object({ type: v.literal('a') }), v.object({ type: v.literal('b') })]),
  picklist: v.picklist(['a', 'b']),
  tuple: v.tuple([v.string(), v.number()]),
});
```

## Should transform coerce method

Before:

```javascript
const Schema = v.coerce(v.date(), (input) => new Date(input));
```

After:

```javascript
const Schema = v.pipe(v.unknown(), v.transform((input) => new Date(input)));
```

## Should transform flatten argument

Before:

```js
const flatErrors1 = v.flatten(error);

// This should be unchanged
const flatErrors2 = v.flatten([issues]);
const flatErrors3 = v.flatten(result.issues);
```

After:

```js
const flatErrors1 = v.flatten(error.issues);

// This should be unchanged
const flatErrors2 = v.flatten([issues]);
const flatErrors3 = v.flatten(result.issues);
```

## Should transform any Valibot wildcard

Before:

```js
import * as foo from 'valibot';
import * as notFoo from 'zod';

const Schema1 = foo.string([foo.email()]);
const Schema2 = notFoo.string([notFoo.email()]);
```

After:

```js
import * as foo from 'valibot';
import * as notFoo from 'zod';

const Schema1 = foo.pipe(foo.string(), foo.email());
const Schema2 = notFoo.string([notFoo.email()]);
```

## Should transform direct Valibot imports

Before:

```js
import { email, flatten, string } from 'valibot';

const Schema = string([email()]);
```

After:

```js
import { email, flatten, string, pipe } from 'valibot';

const Schema = pipe(string(), email());
```

## Should transform brand and transform method

Before:

```js
const Schema1 = v.brand(v.string([v.url()]), 'foo');
const Schema2 = v.transform(v.string(), (input) => input.length);
const Schema3 = v.transform(v.brand(v.string(), 'Name'), (input) => input.length);
const Schema4 = v.brand(v.brand(v.string(), 'Name1'), 'Name2');
const Schema5 = v.transform(v.coerce(v.date(), (input) => new Date(input)), (input) => input.toJSON());
```

After:

```js
const Schema1 = v.pipe(v.string(), v.url(), v.brand('foo'));
const Schema2 = v.pipe(v.string(), v.transform((input) => input.length));
const Schema3 = v.pipe(v.string(), v.brand('Name'), v.transform((input) => input.length));
const Schema4 = v.pipe(v.string(), v.brand('Name1'), v.brand('Name2'));
const Schema5 = v.pipe(v.pipe(v.unknown(), v.transform((input) => new Date(input))), v.transform((input) => input.toJSON()));
```

## Should transform unnecessary pipes

Before:

```js
const Schema1 = v.pipe(v.pipe(v.pipe(v.string()), v.email()), v.maxLength(10));
const Schema2 = v.transform(v.coerce(v.date(), (input) => new Date(input)), (input) => input.toJSON());
```

After:

```js
const Schema1 = v.pipe(v.string(), v.email(), v.maxLength(10));
const Schema2 = v.pipe(v.pipe(v.unknown(), v.transform((input) => new Date(input))), v.transform((input) => input.toJSON()));
```