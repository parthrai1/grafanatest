package kvstore

import (
	"context"

	"github.com/grafana/grafana/pkg/infra/log"
)

type FallbackKVStore struct {
	log         log.Logger
	store       SecretsKVStore
	fallback    SecretsKVStore
	useFallback bool
}

func WithFallback(store SecretsKVStore, fallback SecretsKVStore) *FallbackKVStore {
	return &FallbackKVStore{
		log:         log.New("secrets.kvstore"),
		store:       store,
		fallback:    fallback,
		useFallback: false,
	}
}

func (kv *FallbackKVStore) Get(ctx context.Context, orgId int64, namespace string, typ string) (string, bool, error) {
	if kv.useFallback {
		return kv.fallback.Get(ctx, orgId, namespace, typ)
	}
	return kv.store.Get(ctx, orgId, namespace, typ)
}

func (kv *FallbackKVStore) Set(ctx context.Context, orgId int64, namespace string, typ string, value string) error {
	if kv.useFallback {
		return kv.fallback.Set(ctx, orgId, namespace, typ, value)
	}
	return kv.store.Set(ctx, orgId, namespace, typ, value)
}

func (kv *FallbackKVStore) Del(ctx context.Context, orgId int64, namespace string, typ string) error {
	if kv.useFallback {
		return kv.fallback.Del(ctx, orgId, namespace, typ)
	}
	return kv.store.Del(ctx, orgId, namespace, typ)
}

func (kv *FallbackKVStore) Keys(ctx context.Context, orgId int64, namespace string, typ string) ([]Key, error) {
	if kv.useFallback {
		return kv.fallback.Keys(ctx, orgId, namespace, typ)
	}
	return kv.store.Keys(ctx, orgId, namespace, typ)
}

func (kv *FallbackKVStore) Rename(ctx context.Context, orgId int64, namespace string, typ string, newNamespace string) error {
	if kv.useFallback {
		return kv.fallback.Rename(ctx, orgId, namespace, typ, newNamespace)
	}
	return kv.store.Rename(ctx, orgId, namespace, typ, newNamespace)
}

func (kv *FallbackKVStore) GetAll(ctx context.Context) ([]Item, error) {
	if kv.useFallback {
		return kv.fallback.GetAll(ctx)
	}
	return kv.store.GetAll(ctx)
}

func (kv *FallbackKVStore) GetUnwrappedStore() SecretsKVStore {
	return kv.store
}

func (kv *FallbackKVStore) GetUnwrappedFallback() SecretsKVStore {
	return kv.fallback
}

func (kv *FallbackKVStore) UseFallback(b bool) {
	kv.useFallback = b
}
