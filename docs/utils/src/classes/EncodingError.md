[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [utils/src](../README.md) / EncodingError

# Class: EncodingError

Defined in: [packages/utils/src/errors.ts:160](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/errors.ts#L160)

Encoding/Conversion errors for utils package

## Extends

- [`CirclesError`](CirclesError.md)\<[`UtilsErrorSource`](../type-aliases/UtilsErrorSource.md)\>

## Constructors

### Constructor

```ts
new EncodingError(message, options?): EncodingError;
```

Defined in: [packages/utils/src/errors.ts:161](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/errors.ts#L161)

#### Parameters

##### message

`string`

##### options?

###### code?

`string` \| `number`

###### cause?

`unknown`

###### context?

`Record`\<`string`, `any`\>

#### Returns

`EncodingError`

#### Overrides

[`CirclesError`](CirclesError.md).[`constructor`](CirclesError.md#constructor)

## Properties

### name

```ts
readonly name: string;
```

Defined in: [packages/utils/src/errors.ts:32](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/errors.ts#L32)

#### Inherited from

[`CirclesError`](CirclesError.md).[`name`](CirclesError.md#name)

***

### code?

```ts
readonly optional code: string | number;
```

Defined in: [packages/utils/src/errors.ts:33](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/errors.ts#L33)

#### Inherited from

[`CirclesError`](CirclesError.md).[`code`](CirclesError.md#code)

***

### source

```ts
readonly source: UtilsErrorSource;
```

Defined in: [packages/utils/src/errors.ts:34](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/errors.ts#L34)

#### Inherited from

[`CirclesError`](CirclesError.md).[`source`](CirclesError.md#source)

***

### cause?

```ts
readonly optional cause: unknown;
```

Defined in: [packages/utils/src/errors.ts:35](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/errors.ts#L35)

The cause of the error.

#### Inherited from

[`CirclesError`](CirclesError.md).[`cause`](CirclesError.md#cause)

***

### context?

```ts
readonly optional context: Record<string, any>;
```

Defined in: [packages/utils/src/errors.ts:36](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/errors.ts#L36)

#### Inherited from

[`CirclesError`](CirclesError.md).[`context`](CirclesError.md#context)

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
source: UtilsErrorSource;
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

#### Inherited from

[`CirclesError`](CirclesError.md).[`toJSON`](CirclesError.md#tojson)

***

### toString()

```ts
toString(): string;
```

Defined in: [packages/utils/src/errors.ts:82](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/errors.ts#L82)

Get formatted error message with context

#### Returns

`string`

#### Inherited from

[`CirclesError`](CirclesError.md).[`toString`](CirclesError.md#tostring)

***

### abiEncoding()

```ts
static abiEncoding(functionName, cause?): EncodingError;
```

Defined in: [packages/utils/src/errors.ts:175](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/errors.ts#L175)

Create error for ABI encoding failures

#### Parameters

##### functionName

`string`

##### cause?

`unknown`

#### Returns

`EncodingError`

***

### cidConversion()

```ts
static cidConversion(cid, cause?): EncodingError;
```

Defined in: [packages/utils/src/errors.ts:186](https://github.com/aboutcircles/sdk-v2/blob/45d133ca74f094abc936c2091f055ab0e8645a15/packages/utils/src/errors.ts#L186)

Create error for CID conversion failures

#### Parameters

##### cid

`string`

##### cause?

`unknown`

#### Returns

`EncodingError`
