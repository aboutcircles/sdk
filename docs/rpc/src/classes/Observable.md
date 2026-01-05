[**Circles SDK**](../../../README.md)

***

[Circles SDK](../../../modules.md) / [rpc/src](../README.md) / Observable

# Class: Observable\<TEvent\>

Defined in: [packages/rpc/src/events/observable.ts:5](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/events/observable.ts#L5)

Observable class for event streaming
Provides a simple publish-subscribe pattern for Circles events

## Type Parameters

### TEvent

`TEvent`

## Constructors

### Constructor

```ts
protected new Observable<TEvent>(): Observable<TEvent>;
```

Defined in: [packages/rpc/src/events/observable.ts:23](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/events/observable.ts#L23)

#### Returns

`Observable`\<`TEvent`\>

## Methods

### subscribe()

```ts
subscribe(subscriber): () => void;
```

Defined in: [packages/rpc/src/events/observable.ts:13](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/events/observable.ts#L13)

Subscribe to events

#### Parameters

##### subscriber

(`value`) => `void`

Callback function to be called for each event

#### Returns

Unsubscribe function to stop receiving events

```ts
(): void;
```

##### Returns

`void`

***

### emit()

```ts
protected emit(value): void;
```

Defined in: [packages/rpc/src/events/observable.ts:27](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/events/observable.ts#L27)

#### Parameters

##### value

`TEvent`

#### Returns

`void`

***

### create()

```ts
static create<T>(): object;
```

Defined in: [packages/rpc/src/events/observable.ts:34](https://github.com/aboutcircles/sdk-v2/blob/d93c5485243505702cd4737e16431eb294109cdb/packages/rpc/src/events/observable.ts#L34)

Create a new Observable with an emitter

#### Type Parameters

##### T

`T`

#### Returns

`object`

##### property

```ts
property: Observable<T>;
```

##### emit()

```ts
emit: (e) => void;
```

###### Parameters

###### e

`T`

###### Returns

`void`
