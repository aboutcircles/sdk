[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [utils/src](../README.md) / CirclesError

# Class: CirclesError\<TSource\>

Defined in: [packages/utils/src/errors.ts:31](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/errors.ts#L31)

Base Circles SDK Error
All SDK errors extend from this class

## Extends

- `Error`

## Extended by

- [`ContractError`](ContractError.md)
- [`ValidationError`](ValidationError.md)
- [`EncodingError`](EncodingError.md)

## Type Parameters

### TSource

`TSource` *extends* `string` = `string`

## Constructors

### Constructor

```ts
new CirclesError<TSource>(
   name, 
   message, 
options?): CirclesError<TSource>;
```

Defined in: [packages/utils/src/errors.ts:38](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/errors.ts#L38)

#### Parameters

##### name

`string`

##### message

`string`

##### options?

###### code?

`string` \| `number`

###### source?

`TSource`

###### cause?

`unknown`

###### context?

`Record`\<`string`, `any`\>

#### Returns

`CirclesError`\<`TSource`\>

#### Overrides

```ts
Error.constructor
```

## Properties

### name

```ts
readonly name: string;
```

Defined in: [packages/utils/src/errors.ts:32](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/errors.ts#L32)

#### Overrides

```ts
Error.name
```

***

### code?

```ts
readonly optional code: string | number;
```

Defined in: [packages/utils/src/errors.ts:33](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/errors.ts#L33)

***

### source

```ts
readonly source: TSource;
```

Defined in: [packages/utils/src/errors.ts:34](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/errors.ts#L34)

***

### cause?

```ts
readonly optional cause: unknown;
```

Defined in: [packages/utils/src/errors.ts:35](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/errors.ts#L35)

The cause of the error.

#### Overrides

```ts
Error.cause
```

***

### context?

```ts
readonly optional context: Record<string, any>;
```

Defined in: [packages/utils/src/errors.ts:36](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/errors.ts#L36)

## Methods

### toJSON()

```ts
toJSON(): object;
```

Defined in: [packages/utils/src/errors.ts:64](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/errors.ts#L64)

Convert error to JSON for logging/debugging

#### Returns

`object`

##### name

```ts
name: string;
```

##### message

```ts
message: string;
```

##### code

```ts
code: string | number | undefined;
```

##### source

```ts
source: TSource;
```

##### context

```ts
context: Record<string, any> | undefined;
```

##### cause

```ts
cause: unknown;
```

##### stack

```ts
stack: string | undefined;
```

***

### toString()

```ts
toString(): string;
```

Defined in: [packages/utils/src/errors.ts:82](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/errors.ts#L82)

Get formatted error message with context

#### Returns

`string`
